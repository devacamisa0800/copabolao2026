import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type WorldCupMatch = {
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

type ExistingWorldCupMatch = Partial<WorldCupMatch> & {
  id: string;
};

const SOURCE_URL = 'https://raw.githubusercontent.com/openfootball/worldcup/master/2026--usa/cup.txt';

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

const TEAM_ALIASES: Record<string, string> = {
  USA: 'Estados Unidos',
  'United States': 'Estados Unidos',
  Mexico: 'México',
  Canada: 'Canadá',
  Brazil: 'Brasil',
  Germany: 'Alemanha',
  Netherlands: 'Holanda',
  Belgium: 'Bélgica',
  Egypt: 'Egito',
  Iran: 'Irã',
  'IR Iran': 'Irã',
  'New Zealand': 'Nova Zelândia',
  Spain: 'Espanha',
  'Cape Verde': 'Cabo Verde',
  'Cabo Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arábia Saudita',
  Uruguay: 'Uruguai',
  France: 'França',
  Senegal: 'Senegal',
  Iraq: 'Iraque',
  Norway: 'Noruega',
  Argentina: 'Argentina',
  Algeria: 'Argélia',
  Austria: 'Áustria',
  Jordan: 'Jordânia',
  Portugal: 'Portugal',
  'DR Congo': 'RD Congo',
  'Congo DR': 'RD Congo',
  Uzbekistan: 'Uzbequistão',
  Colombia: 'Colômbia',
  England: 'Inglaterra',
  Croatia: 'Croácia',
  Ghana: 'Gana',
  Panama: 'Panamá',
  Morocco: 'Marrocos',
  Haiti: 'Haiti',
  Scotland: 'Escócia',
  Paraguay: 'Paraguai',
  Australia: 'Austrália',
  Turkey: 'Turquia',
  Turkiye: 'Turquia',
  Türkiye: 'Turquia',
  'South Africa': 'África do Sul',
  'South Korea': 'Coreia do Sul',
  'Korea Republic': 'Coreia do Sul',
  'Czech Republic': 'Chéquia',
  Czechia: 'Chéquia',
  Qatar: 'Catar',
  Switzerland: 'Suíça',
  Japan: 'Japão',
  Sweden: 'Suécia',
  Tunisia: 'Tunísia',
  Ecuador: 'Equador',
  'Ivory Coast': 'Costa do Marfim',
  "Cote d'Ivoire": 'Costa do Marfim',
  "Côte d'Ivoire": 'Costa do Marfim',
  Curacao: 'Curaçao',
  Curaçao: 'Curaçao',
  'Bosnia & Herzegovina': 'Bósnia',
  'Bosnia and Herzegovina': 'Bósnia',
};

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeTextForMatch(value: string | null | undefined): string {
  return normalizeSpaces(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function normalizeTeamName(value: string): string {
  const clean = normalizeSpaces(value);
  return TEAM_ALIASES[clean] ?? clean;
}

function matchKey(jogo: Pick<WorldCupMatch, 'time_casa' | 'time_fora' | 'grupo'>): string {
  return [
    normalizeTextForMatch(jogo.grupo),
    normalizeTextForMatch(jogo.time_casa),
    normalizeTextForMatch(jogo.time_fora),
  ].join('|');
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
  if (!match) return { estadio: null, cidade: clean };

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

    if (looksLikeScorers) return normalizeSpaces(singleParenthesesMatch[1]);
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

  const { estadio, cidade } = splitStadiumAndCity(cleanLocation(match[4]));

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

function parseWorldCupFootballTxt(source: string, year = 2026): WorldCupMatch[] {
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

async function recalcularClassificacaoGrupos(supabase: ReturnType<typeof createClient>) {
  const { error: resetError } = await supabase
    .from('grupos')
    .update({
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      gols_pro: 0,
      gols_contra: 0,
      saldo: 0,
    })
    .not('id', 'is', null);

  if (resetError) throw resetError;

  const { data: jogosGrupo, error: jogosError } = await supabase
    .from('jogos')
    .select('grupo,time_casa,time_fora,placar_casa,placar_fora')
    .eq('fase', 'Grupo')
    .not('placar_casa', 'is', null)
    .not('placar_fora', 'is', null);

  if (jogosError) throw jogosError;

  const classificacao = new Map<string, {
    grupo: string;
    selecao: string;
    pontos: number;
    jogos: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    gols_pro: number;
    gols_contra: number;
    saldo: number;
  }>();

  function garantirLinha(grupo: string, selecao: string) {
    const chave = `${grupo}|${selecao}`;

    if (!classificacao.has(chave)) {
      classificacao.set(chave, {
        grupo,
        selecao,
        pontos: 0,
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols_pro: 0,
        gols_contra: 0,
        saldo: 0,
      });
    }

    return classificacao.get(chave)!;
  }

  for (const jogo of jogosGrupo ?? []) {
    if (!jogo.grupo || jogo.placar_casa === null || jogo.placar_fora === null) {
      continue;
    }

    const casa = garantirLinha(jogo.grupo, jogo.time_casa);
    const fora = garantirLinha(jogo.grupo, jogo.time_fora);

    casa.jogos += 1;
    casa.gols_pro += jogo.placar_casa;
    casa.gols_contra += jogo.placar_fora;
    casa.saldo = casa.gols_pro - casa.gols_contra;

    fora.jogos += 1;
    fora.gols_pro += jogo.placar_fora;
    fora.gols_contra += jogo.placar_casa;
    fora.saldo = fora.gols_pro - fora.gols_contra;

    if (jogo.placar_casa > jogo.placar_fora) {
      casa.pontos += 3;
      casa.vitorias += 1;
      fora.derrotas += 1;
    } else if (jogo.placar_casa < jogo.placar_fora) {
      fora.pontos += 3;
      fora.vitorias += 1;
      casa.derrotas += 1;
    } else {
      casa.pontos += 1;
      fora.pontos += 1;
      casa.empates += 1;
      fora.empates += 1;
    }
  }

  for (const linha of classificacao.values()) {
    const { error: updateError } = await supabase
      .from('grupos')
      .update({
        pontos: linha.pontos,
        jogos: linha.jogos,
        vitorias: linha.vitorias,
        empates: linha.empates,
        derrotas: linha.derrotas,
        gols_pro: linha.gols_pro,
        gols_contra: linha.gols_contra,
        saldo: linha.saldo,
      })
      .eq('grupo', linha.grupo)
      .eq('selecao', linha.selecao);

    if (updateError) throw updateError;
  }

  return classificacao.size;
}

function hasGameChanged(current: Partial<WorldCupMatch> | null, next: WorldCupMatch): boolean {
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

Deno.serve(async () => {
  const startedAt = new Date().toISOString();

  try {
    console.log('[sync_world_cup] Iniciada', { startedAt });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        {
          ok: false,
          step: 'env',
          error: 'Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.',
        },
        { status: 500 },
      );
    }

    const response = await fetch(SOURCE_URL);

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          step: 'fetch_source',
          error: `Falha ao baixar arquivo remoto: ${response.status}`,
        },
        { status: 502 },
      );
    }

    const text = await response.text();
    const jogos = parseWorldCupFootballTxt(text);

    console.log('[sync_world_cup] Parser concluído', {
      totalJogos: jogos.length,
      primeiroJogo: jogos[0] ?? null,
      ultimoJogo: jogos[jogos.length - 1] ?? null,
    });

    if (jogos.length === 0) {
      return Response.json(
        {
          ok: false,
          step: 'parser',
          error: 'Parser não encontrou jogos no arquivo remoto.',
          sourcePreview: text.slice(0, 500),
        },
        { status: 422 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const apiIds = jogos.map((jogo) => jogo.api_id);

    const { data: existentes, error: selectError } = await supabase
      .from('jogos')
      .select('id,api_id,time_casa,time_fora,data_jogo,fase,grupo,status,placar_casa,placar_fora,estadio,cidade')
      .or(`api_id.in.(${apiIds.join(',')}),fase.eq.Grupo`);

    if (selectError) throw selectError;

    const jogosExistentes = (existentes ?? []) as ExistingWorldCupMatch[];

    const porApiId = new Map<string, ExistingWorldCupMatch>();
    const porMatchKey = new Map<string, ExistingWorldCupMatch[]>();

    for (const jogo of jogosExistentes) {
      if (jogo.api_id) porApiId.set(String(jogo.api_id), jogo);

      if (jogo.time_casa && jogo.time_fora && jogo.grupo) {
        const key = matchKey({
          time_casa: String(jogo.time_casa),
          time_fora: String(jogo.time_fora),
          grupo: String(jogo.grupo),
        });

        const current = porMatchKey.get(key) ?? [];
        current.push(jogo);
        porMatchKey.set(key, current);
      }
    }

    let totalAtualizadosPorApiId = 0;
    let totalVinculadosPorTimes = 0;
    let totalInseridos = 0;
    let totalIgnorados = 0;

    for (const jogo of jogos) {
      const existentePorApiId = porApiId.get(jogo.api_id);

      if (existentePorApiId) {
        if (!hasGameChanged(existentePorApiId, jogo)) {
          totalIgnorados += 1;
          continue;
        }

        const { error: updateError } = await supabase.from('jogos').update(jogo).eq('id', existentePorApiId.id);
        if (updateError) throw updateError;

        totalAtualizadosPorApiId += 1;
        continue;
      }

      const candidatos = porMatchKey.get(matchKey(jogo)) ?? [];
      const candidatoSemApiId = candidatos.find((candidato) => !candidato.api_id);

      if (candidatoSemApiId) {
        const { error: updateError } = await supabase.from('jogos').update(jogo).eq('id', candidatoSemApiId.id);
        if (updateError) throw updateError;

        porApiId.set(jogo.api_id, {
          id: candidatoSemApiId.id,
          ...jogo,
        });

        totalVinculadosPorTimes += 1;
        continue;
      }

      const { error: insertError } = await supabase.from('jogos').insert(jogo);
      if (insertError) throw insertError;

      totalInseridos += 1;
    }

    const totalClassificacaoRecalculada = await recalcularClassificacaoGrupos(supabase);

    const finishedAt = new Date().toISOString();

    return Response.json({
      ok: true,
      source: SOURCE_URL,
      started_at: startedAt,
      finished_at: finishedAt,
      total_lidos: jogos.length,
      total_atualizados_por_api_id: totalAtualizadosPorApiId,
      total_vinculados_por_times: totalVinculadosPorTimes,
      total_inseridos: totalInseridos,
      total_ignorados: totalIgnorados,
      total_classificacao_recalculada: totalClassificacaoRecalculada,
    });
  } catch (error) {
    console.error('[sync_world_cup] ERRO FATAL', error);

    return Response.json(
      {
        ok: false,
        step: 'fatal',
        started_at: startedAt,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    );
  }
});
