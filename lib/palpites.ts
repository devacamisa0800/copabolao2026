import { supabase } from './supabase';

export type Jogo = {
  id: string;
  time_casa: string;
  time_fora: string;
  data_jogo: string | null;
  fase: string | null;
  grupo: string | null;
  status: string | null;
  placar_casa: number | null;
  placar_fora: number | null;
};

export type Palpite = {
  id: string;
  participante_id: string;
  jogo_id: string;
  gols_casa: number;
  gols_fora: number;
  pontos: number | null;
};

export type JogoComPalpite = Jogo & {
  palpite: Palpite | null;
};

export async function buscarParticipanteDoBolao(
  bolaoId: string,
  usuarioId: string
) {
  const { data, error } = await supabase
    .from('participantes')
    .select('id')
    .eq('bolao_id', bolaoId)
    .eq('usuario_id', usuarioId)
    .maybeSingle();

  if (error) {
    throw new Error('Não foi possível carregar o participante.');
  }

  return data;
}

export async function buscarJogosComPalpites(
  participanteId: string
): Promise<JogoComPalpite[]> {
  const { data: jogos, error: erroJogos } = await supabase
    .from('jogos')
    .select(
      'id, time_casa, time_fora, data_jogo, fase, grupo, status, placar_casa, placar_fora'
    )
    .order('data_jogo', { ascending: true });

  if (erroJogos) {
    throw new Error('Não foi possível carregar os jogos.');
  }

  const { data: palpites, error: erroPalpites } = await supabase
    .from('palpites')
    .select('id, participante_id, jogo_id, gols_casa, gols_fora, pontos')
    .eq('participante_id', participanteId);

  if (erroPalpites) {
    throw new Error('Não foi possível carregar seus palpites.');
  }

  return (jogos ?? []).map((jogo) => {
    const palpite =
      palpites?.find((item) => item.jogo_id === jogo.id) ?? null;

    return {
      ...jogo,
      palpite,
    };
  });
}

export async function salvarPalpite(params: {
  participanteId: string;
  jogoId: string;
  golsCasa: number;
  golsFora: number;
}) {
  const { participanteId, jogoId, golsCasa, golsFora } = params;

  const { data, error } = await supabase
    .from('palpites')
    .upsert(
      {
        participante_id: participanteId,
        jogo_id: jogoId,
        gols_casa: golsCasa,
        gols_fora: golsFora,
        atualizado_em: new Date().toISOString(),
      },
      {
        onConflict: 'participante_id,jogo_id',
      }
    )
    .select('id, participante_id, jogo_id, gols_casa, gols_fora, pontos')
    .single();

  if (error) {
    console.log('ERRO AO SALVAR PALPITE:', error);
    throw new Error(error.message || 'Não foi possível salvar o palpite.');
  }

  return data;
}

export function jogoJaComecou(dataJogo: string | null) {
  if (!dataJogo) return false;

  const agora = new Date();
  const data = new Date(dataJogo);

  return agora >= data;
}