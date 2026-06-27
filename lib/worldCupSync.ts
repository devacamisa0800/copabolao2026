import { traduzirPais } from '../constants/selecoes';

export type WorldCupMatch = {
  api_id: string;
  time_casa: string;
  time_fora: string;
  data_jogo: string | null;
  fase: string | null;
  grupo: string | null;
  status: 'agendado' | 'encerrado';
  placar_casa: number | null;
  placar_fora: number | null;
  estadio: string | null;
  cidade: string | null;
};

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const WEEKDAYS = '(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)';
const MONTH_NAMES =
  '(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)';

const TEAM_NAME_ALIASES: Record<string, string> = {
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Czech Republic': 'Czechia',
  Czechia: 'Czechia',
  'South Korea': 'Korea Republic',
  USA: 'USA',
  'United States': 'USA',
  'DR Congo': 'DR Congo',
  'Congo DR': 'Congo DR',
  'Ivory Coast': 'Ivory Coast',
  "Cote d'Ivoire": "Cote d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire",
  Turkiye: 'Turkiye',
  Türkiye: 'Türkiye',
  Turkey: 'Turkey',
  Curacao: 'Curacao',
  Curaçao: 'Curaçao',
};

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeTeamName(value: string): string {
  const clean = normalizeSpaces(value);
  const aliased = TEAM_NAME_ALIASES[clean] ?? clean;
  return traduzirPais(aliased);
}

function parseDateToken(token: string): { month: number; day: number } | null {
  const match = token.match(new RegExp(`^${WEEKDAYS}\\s+([A-Za-z]+)\\s+(\\d{1,2})$`, 'i'));
  if (!match) return null;

  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return null;

  return { month, day: Number(match[2]) };
}

function parseUtcOffset(value: string | undefined): number {
  if (!value) return 0;

  const match = value.match(/^UTC([+-])(\d{1,2})$/i);
  if (!match) return 0;

  const sign = match[1] === '+' ? 1 : -1;
  return sign * Number(match[2]);
}

function buildIsoDate(year: number, month: number, day: number, time: string, utcOffset: string | undefined): string {
  const [hour, minute] = time.split(':').map(Number);
  const offset = parseUtcOffset(utcOffset);
  const utcHour = hour - offset;
  return new Date(Date.UTC(year, month, day, utcHour, minute, 0)).toISOString();
}

function splitStadiumAndCity(location: string): { estadio: string | null; cidade: string | null } {
  const clean = normalizeSpaces(location);
  if (!clean) return { estadio: null, cidade: null };

  const match = clean.match(/^(.+?),\s*(.+)$/);
  if (!match) {
    return {
      estadio: null,
      cidade: clean,
    };
  }

  return {
    estadio: normalizeSpaces(match[1]),
    cidade: normalizeSpaces(match[2]),
  };
}

function cleanLocation(rawLocation: string): string {
  const location = normalizeSpaces(rawLocation);

  const secondParenthesesIndex = location.indexOf(') (');
  if (secondParenthesesIndex >= 0) {
    return normalizeSpaces(location.slice(0, secondParenthesesIndex + 1));
  }

  const singleParenthesesMatch = location.match(/^(.+?)\s+\((.+)\)$/);
  if (singleParenthesesMatch) {
    const insideParentheses = singleParenthesesMatch[2];
    const looksLikeScorers = /(?:\d+'|\d+\+\d+|;|,|og|OG|p\))/i.test(insideParentheses);

    if (looksLikeScorers) {
      return normalizeSpaces(singleParenthesesMatch[1]);
    }
  }

  return location;
}

function parseTeamsAndScore(value: string): {
  home: string;
  away: string;
  placar_casa: number | null;
  placar_fora: number | null;
} | null {
  const clean = normalizeSpaces(value);

  const scheduledMatch = clean.match(/^(.+?)\s+v\s+(.+)$/i);
  if (scheduledMatch) {
    return {
      home: normalizeSpaces(scheduledMatch[1]),
      away: normalizeSpaces(scheduledMatch[2]),
      placar_casa: null,
      placar_fora: null,
    };
  }

  const finishedMatch = clean.match(/^(.+?)\s+(\d+)\s*-\s*(\d+)\s*(?:\([^)]+\))?\s+(.+)$/);
  if (!finishedMatch) return null;

  return {
    home: normalizeSpaces(finishedMatch[1]),
    placar_casa: Number(finishedMatch[2]),
    placar_fora: Number(finishedMatch[3]),
    away: normalizeSpaces(finishedMatch[4]),
  };
}

function parseMatchEntry(params: {
  entry: string;
  year: number;
  month: number;
  day: number;
  group: string;
  index: number;
}): WorldCupMatch | null {
  const entry = normalizeSpaces(params.entry);
  const match = entry.match(/^(\d{1,2}:\d{2})(?:\s+(UTC[+-]\d{1,2}))?\s+(.+?)\s+@\s+(.+)$/i);
  if (!match) return null;

  const time = match[1];
  const utcOffset = match[2];
  const teamsAndScore = parseTeamsAndScore(match[3]);
  if (!teamsAndScore) return null;

  const location = cleanLocation(match[4]);
  const { estadio, cidade } = splitStadiumAndCity(location);

  return {
    api_id: `openfootball-worldcup-2026-${String(params.index).padStart(3, '0')}`,
    time_casa: normalizeTeamName(teamsAndScore.home),
    time_fora: normalizeTeamName(teamsAndScore.away),
    data_jogo: buildIsoDate(params.year, params.month, params.day, time, utcOffset),
    fase: 'Grupo',
    grupo: params.group,
    status:
      teamsAndScore.placar_casa === null || teamsAndScore.placar_fora === null
        ? 'agendado'
        : 'encerrado',
    placar_casa: teamsAndScore.placar_casa,
    placar_fora: teamsAndScore.placar_fora,
    estadio,
    cidade,
  };
}

function extractGroupBlocks(source: string): { group: string; content: string }[] {
  const normalized = normalizeSpaces(source);
  const groupRegex = /▪\s*Group\s+([A-L])\s*/gi;
  const starts: { group: string; start: number; endOfHeader: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = groupRegex.exec(normalized)) !== null) {
    starts.push({
      group: match[1].toUpperCase(),
      start: match.index,
      endOfHeader: groupRegex.lastIndex,
    });
  }

  return starts.map((item, index) => {
    const next = starts[index + 1];
    return {
      group: item.group,
      content: normalized.slice(item.endOfHeader, next?.start ?? normalized.length),
    };
  });
}

function extractDatedMatchEntries(groupContent: string): { dateToken: string | null; entry: string }[] {
  const tokenRegex = new RegExp(
    `(${WEEKDAYS}\\s+${MONTH_NAMES}\\s+\\d{1,2})|(\\d{1,2}:\\d{2}\\s+UTC[+-]\\d{1,2})`,
    'gi',
  );

  const tokens: { type: 'date' | 'match'; value: string; index: number }[] = [];
  let token: RegExpExecArray | null;

  while ((token = tokenRegex.exec(groupContent)) !== null) {
    tokens.push({
      type: token[1] ? 'date' : 'match',
      value: token[0],
      index: token.index,
    });
  }

  const entries: { dateToken: string | null; entry: string }[] = [];
  let currentDateToken: string | null = null;

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];

    if (current.type === 'date') {
      currentDateToken = current.value;
      continue;
    }

    const next = tokens[index + 1];
    entries.push({
      dateToken: currentDateToken,
      entry: groupContent.slice(current.index, next?.index ?? groupContent.length),
    });
  }

  return entries;
}

export function parseWorldCupFootballTxt(source: string, year = 2026): WorldCupMatch[] {
  const matches: WorldCupMatch[] = [];
  const groupBlocks = extractGroupBlocks(source);

  for (const block of groupBlocks) {
    const entries = extractDatedMatchEntries(block.content);

    for (const item of entries) {
      if (!item.dateToken) continue;

      const date = parseDateToken(item.dateToken);
      if (!date) continue;

      const parsed = parseMatchEntry({
        entry: item.entry,
        year,
        month: date.month,
        day: date.day,
        group: block.group,
        index: matches.length + 1,
      });

      if (parsed) matches.push(parsed);
    }
  }

  return matches;
}

export function hasGameChanged(current: Partial<WorldCupMatch> | null, next: WorldCupMatch): boolean {
  if (!current) return true;

  const keys: (keyof WorldCupMatch)[] = [
    'time_casa',
    'time_fora',
    'data_jogo',
    'fase',
    'grupo',
    'status',
    'placar_casa',
    'placar_fora',
    'estadio',
    'cidade',
  ];

  return keys.some((key) => (current[key] ?? null) !== (next[key] ?? null));
}
