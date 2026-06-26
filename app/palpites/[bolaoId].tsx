import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { bandeiraPais, traduzirPais } from '@/constants/selecoes';
import {
  buscarJogosComPalpites,
  buscarParticipanteDoBolao,
  JogoComPalpite,
  jogoJaComecou,
  salvarPalpite,
} from '@/lib/palpites';
import { supabase } from '@/lib/supabase';

type UsuarioApp = {
  id: string;
};

type PalpiteInput = {
  golsCasa: string;
  golsFora: string;
};

export default function PalpitesScreen() {
  const { bolaoId } = useLocalSearchParams<{ bolaoId: string }>();

  const [participanteId, setParticipanteId] = useState<string | null>(null);
  const [jogos, setJogos] = useState<JogoComPalpite[]>([]);
  const [palpites, setPalpites] = useState<Record<string, PalpiteInput>>({});
  const [carregando, setCarregando] = useState(false);
  const [salvandoJogoId, setSalvandoJogoId] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    if (!bolaoId) return;

    setCarregando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const { data: usuarioApp, error: erroUsuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (erroUsuario || !usuarioApp) {
        Alert.alert('Erro', 'Não foi possível carregar seu usuário.');
        return;
      }

      const participante = await buscarParticipanteDoBolao(
        bolaoId,
        (usuarioApp as UsuarioApp).id
      );

      if (!participante) {
        Alert.alert('Erro', 'Você não participa deste bolão.');
        return;
      }

      setParticipanteId(participante.id);

      const jogosCarregados = await buscarJogosComPalpites(participante.id);

      const palpitesIniciais: Record<string, PalpiteInput> = {};

      jogosCarregados.forEach((jogo) => {
        palpitesIniciais[jogo.id] = {
          golsCasa:
            jogo.palpite?.gols_casa !== undefined &&
            jogo.palpite?.gols_casa !== null
              ? String(jogo.palpite.gols_casa)
              : '',
          golsFora:
            jogo.palpite?.gols_fora !== undefined &&
            jogo.palpite?.gols_fora !== null
              ? String(jogo.palpite.gols_fora)
              : '',
        };
      });

      setJogos(jogosCarregados);
      setPalpites(palpitesIniciais);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os palpites.');
    } finally {
      setCarregando(false);
    }
  }, [bolaoId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const jogosOrdenados = useMemo(() => {
    return [...jogos].sort((a, b) => {
      const aBloqueado = jogoJaComecou(a.data_jogo);
      const bBloqueado = jogoJaComecou(b.data_jogo);

      if (aBloqueado !== bBloqueado) {
        return aBloqueado ? 1 : -1;
      }

      const dataA = a.data_jogo ? new Date(a.data_jogo).getTime() : 0;
      const dataB = b.data_jogo ? new Date(b.data_jogo).getTime() : 0;

      return dataA - dataB;
    });
  }, [jogos]);

  const jogosAbertos = jogosOrdenados.filter(
    (jogo) => !jogoJaComecou(jogo.data_jogo)
  );

  const jogosEncerrados = jogosOrdenados.filter((jogo) =>
    jogoJaComecou(jogo.data_jogo)
  );

  function voltarParaBolao() {
    if (!bolaoId) {
      router.replace('/(tabs)/bolao');
      return;
    }

    router.replace(`/bolao/${bolaoId}` as any);
  }

  function atualizarPalpite(
    jogoId: string,
    campo: 'golsCasa' | 'golsFora',
    valor: string
  ) {
    const valorNumerico = valor.replace(/[^0-9]/g, '');

    setPalpites((atual) => ({
      ...atual,
      [jogoId]: {
        ...atual[jogoId],
        [campo]: valorNumerico,
      },
    }));
  }

  async function salvar(jogo: JogoComPalpite) {
    if (!participanteId) return;

    const palpite = palpites[jogo.id];

    if (!palpite || palpite.golsCasa === '' || palpite.golsFora === '') {
      Alert.alert('Atenção', 'Informe o placar completo.');
      return;
    }

    if (jogoJaComecou(jogo.data_jogo)) {
      Alert.alert(
        'Atenção',
        'Este jogo já começou. O palpite não pode ser alterado.'
      );
      return;
    }

    setSalvandoJogoId(jogo.id);

    try {
      await salvarPalpite({
        participanteId,
        jogoId: jogo.id,
        golsCasa: Number(palpite.golsCasa),
        golsFora: Number(palpite.golsFora),
      });

      await carregarDados();

      Alert.alert('Sucesso', 'Palpite salvo.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o palpite.');
    } finally {
      setSalvandoJogoId(null);
    }
  }

  function traduzirFase(fase: string | null, grupo: string | null) {
    const valor = fase || grupo;

    if (!valor) return 'Copa 2026';

    const mapa: Record<string, string> = {
      'group-stage': 'Fase de Grupos',
      group_stage: 'Fase de Grupos',
      groups: 'Fase de Grupos',
      'round-of-16': 'Oitavas de Final',
      round_of_16: 'Oitavas de Final',
      'quarter-finals': 'Quartas de Final',
      quarter_finals: 'Quartas de Final',
      'semi-finals': 'Semifinal',
      semi_finals: 'Semifinal',
      'third-place': 'Disputa de 3º Lugar',
      third_place: 'Disputa de 3º Lugar',
      final: 'Final',
    };

    return mapa[valor.toLowerCase()] || valor;
  }

  function formatarData(dataJogo: string | null) {
    if (!dataJogo) return 'Data a definir';

    const data = new Date(dataJogo);

    return data.toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function temResultado(jogo: JogoComPalpite) {
    return jogo.placar_casa !== null && jogo.placar_fora !== null;
  }

  function statusVisual(jogo: JogoComPalpite) {
    if (jogoJaComecou(jogo.data_jogo)) {
      return {
        texto: '🔒 Jogo encerrado',
        detalhe: jogo.palpite ? 'Palpite registrado' : 'Sem palpite enviado',
      };
    }

    if (jogo.palpite) {
      return {
        texto: '🟡 Palpite salvo',
        detalhe: 'Você ainda pode editar antes do jogo começar',
      };
    }

    return {
      texto: '🟢 Aberto para palpites',
      detalhe: 'Informe o placar e salve seu palpite',
    };
  }

  function renderizarJogo(jogo: JogoComPalpite) {
    const bloqueado = jogoJaComecou(jogo.data_jogo);
    const palpiteAtual = palpites[jogo.id] || {
      golsCasa: '',
      golsFora: '',
    };
    const status = statusVisual(jogo);

    const nomeCasa = traduzirPais(jogo.time_casa);
    const nomeFora = traduzirPais(jogo.time_fora);
    const bandeiraCasa = bandeiraPais(jogo.time_casa);
    const bandeiraFora = bandeiraPais(jogo.time_fora);

    if (bloqueado) {
      return (
        <View key={jogo.id} style={[styles.card, styles.cardEncerrado]}>
          <View style={styles.cardHeader}>
            <Text style={styles.fase}>{traduzirFase(jogo.fase, jogo.grupo)}</Text>
            <Text style={styles.data}>{formatarData(jogo.data_jogo)}</Text>
          </View>

          <Text style={styles.matchCompact}>
            {bandeiraCasa} {nomeCasa} x {nomeFora} {bandeiraFora}
          </Text>

          <View style={styles.compactInfoBox}>
            <Text style={styles.status}>{status.texto}</Text>
            <Text style={styles.statusDetail}>{status.detalhe}</Text>

            {jogo.palpite && (
              <Text style={styles.compactText}>
                Seu palpite: {jogo.palpite.gols_casa} x {jogo.palpite.gols_fora}
              </Text>
            )}

            {temResultado(jogo) && (
              <Text style={styles.compactText}>
                Resultado: {jogo.placar_casa} x {jogo.placar_fora}
              </Text>
            )}
          </View>
        </View>
      );
    }

    return (
      <View key={jogo.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.fase}>{traduzirFase(jogo.fase, jogo.grupo)}</Text>
          <Text style={styles.data}>{formatarData(jogo.data_jogo)}</Text>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.status}>{status.texto}</Text>
          <Text style={styles.statusDetail}>{status.detalhe}</Text>
        </View>

        <View style={styles.teams}>
          <Text style={styles.teamName}>
            {bandeiraCasa} {nomeCasa}
          </Text>

          <View style={styles.scoreRow}>
            <TextInput
              style={styles.scoreInput}
              keyboardType="number-pad"
              maxLength={2}
              editable
              value={palpiteAtual.golsCasa}
              onChangeText={(valor) =>
                atualizarPalpite(jogo.id, 'golsCasa', valor)
              }
            />

            <Text style={styles.vs}>x</Text>

            <TextInput
              style={styles.scoreInput}
              keyboardType="number-pad"
              maxLength={2}
              editable
              value={palpiteAtual.golsFora}
              onChangeText={(valor) =>
                atualizarPalpite(jogo.id, 'golsFora', valor)
              }
            />
          </View>

          <Text style={styles.teamName}>
            {bandeiraFora} {nomeFora}
          </Text>
        </View>

        <Pressable
          style={styles.saveButton}
          disabled={salvandoJogoId === jogo.id}
          onPress={() => salvar(jogo)}
        >
          <Text style={styles.saveButtonText}>
            {salvandoJogoId === jogo.id
              ? 'Salvando...'
              : jogo.palpite
                ? 'Salvar Alterações'
                : 'Salvar Palpite'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={carregando} onRefresh={carregarDados} />
      }
    >
      <Pressable style={styles.backButton} onPress={voltarParaBolao}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Palpites</Text>
      <Text style={styles.subtitle}>Faça seus palpites para os jogos da Copa</Text>

      {jogos.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum jogo encontrado.</Text>
      ) : (
        <>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              {jogosAbertos.length} de {jogos.length} jogos abertos para palpites
            </Text>
            <Text style={styles.summaryDetail}>
              Jogos encerrados aparecem no final em formato resumido.
            </Text>
          </View>

          {jogosAbertos.map(renderizarJogo)}

          {jogosEncerrados.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Jogos encerrados</Text>
              {jogosEncerrados.map(renderizarJogo)}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F3A',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 8,
    paddingRight: 16,
  },

  backButtonText: {
    color: '#F5C542',
    fontSize: 18,
    fontWeight: 'bold',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },

  subtitle: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 8,
    marginBottom: 20,
  },

  summaryBox: {
    backgroundColor: '#102B4C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },

  summaryText: {
    color: '#F5C542',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  summaryDetail: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 4,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 12,
  },

  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 32,
  },

  card: {
    backgroundColor: '#17365D',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },

  cardEncerrado: {
    opacity: 0.88,
    padding: 14,
    marginBottom: 12,
  },

  cardHeader: {
    marginBottom: 12,
  },

  fase: {
    color: '#F5C542',
    fontSize: 17,
    fontWeight: 'bold',
  },

  data: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.85,
    marginTop: 4,
    textTransform: 'capitalize',
  },

  statusBox: {
    backgroundColor: '#0B1F3A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  status: {
    color: '#F5C542',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  statusDetail: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
  },

  teams: {
    alignItems: 'center',
    marginBottom: 16,
  },

  teamName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },

  matchCompact: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  compactInfoBox: {
    backgroundColor: '#0B1F3A',
    borderRadius: 12,
    padding: 12,
  },

  compactText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 6,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 6,
  },

  scoreInput: {
    backgroundColor: '#FFFFFF',
    color: '#0B1F3A',
    width: 68,
    height: 58,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
  },

  vs: {
    color: '#F5C542',
    fontSize: 26,
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#F5C542',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});