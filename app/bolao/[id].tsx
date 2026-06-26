import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

type Bolao = {
  id: string;
  nome: string;
  codigo: string;
};

type Participante = {
  id: string;
  usuarios:
    | {
        nome_completo: string | null;
        apelido: string | null;
        email: string | null;
      }
    | {
        nome_completo: string | null;
        apelido: string | null;
        email: string | null;
      }[]
    | null;
};

type RankingItem = {
  participante_id: string;
  usuario_id: string;
  nome: string;
  foto_url: string | null;
  total_pontos: number;
  palpites_com_pontos: number;
};

export default function BolaoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [bolao, setBolao] = useState<Bolao | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregarDetalhes = useCallback(async () => {
    if (!id) return;

    setCarregando(true);

    const { data: bolaoData, error: erroBolao } = await supabase
      .from('boloes')
      .select('id, nome, codigo')
      .eq('id', id)
      .maybeSingle();

    if (erroBolao || !bolaoData) {
      setCarregando(false);
      Alert.alert('Erro', 'Não foi possível carregar o bolão.');
      return;
    }

    const { data: participantesData, error: erroParticipantes } =
      await supabase
        .from('participantes')
        .select('id, usuarios(nome_completo, apelido, email)')
        .eq('bolao_id', id);

    if (erroParticipantes) {
      setCarregando(false);
      Alert.alert('Erro', 'Não foi possível carregar os participantes.');
      return;
    }

    const { data: rankingData, error: erroRanking } = await supabase.rpc(
      'ranking_bolao',
      {
        bolao_uuid: id,
      }
    );

    setCarregando(false);

    if (erroRanking) {
      Alert.alert('Erro', 'Não foi possível carregar o ranking.');
      return;
    }

    setBolao(bolaoData);
    setParticipantes(participantesData ?? []);
    setRanking((rankingData ?? []) as RankingItem[]);
  }, [id]);

  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  async function copiarCodigo() {
    if (!bolao) return;

    await Clipboard.setStringAsync(bolao.codigo);
    Alert.alert('Código copiado', `Código ${bolao.codigo} copiado.`);
  }

  async function compartilharConvite() {
    if (!bolao) return;

    const mensagem =
      `Você foi convidado para participar do bolão "${bolao.nome}" no CopaBolão 2026!\n\n` +
      `Código do convite: ${bolao.codigo}\n\n` +
      `Abra o app CopaBolão 2026, toque em "Entrar com Código" e digite esse código.`;

    await Share.share({
      message: mensagem,
    });
  }

  function abrirPalpites() {
    if (!bolao) return;

    router.push(`/palpites/${bolao.id}` as any);
  }

  function abrirRanking() {
    if (!bolao) return;

    router.push(`/ranking/${bolao.id}` as any);
  }

  function nomeParticipante(participante: Participante) {
    const usuario = Array.isArray(participante.usuarios)
      ? participante.usuarios[0]
      : participante.usuarios;

    return (
      usuario?.apelido ||
      usuario?.nome_completo ||
      usuario?.email ||
      'Participante'
    );
  }

  function medalha(posicao: number) {
    if (posicao === 0) return '🥇';
    if (posicao === 1) return '🥈';
    if (posicao === 2) return '🥉';

    return `${posicao + 1}º`;
  }

  const rankingResumo = ranking.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={carregando} onRefresh={carregarDetalhes} />
      }
    >
      <Text
        style={styles.title}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {bolao?.nome || 'Bolão'}
      </Text>

      {bolao && (
        <View style={styles.mainActions}>
          <Pressable style={styles.palpitesButton} onPress={abrirPalpites}>
            <Text style={styles.palpitesButtonText}>⚽ Fazer Palpites</Text>
          </Pressable>

          <Pressable style={styles.rankingButton} onPress={abrirRanking}>
            <Text style={styles.rankingButtonText}>🏆 Ver Ranking</Text>
          </Pressable>
        </View>
      )}

      {bolao && (
        <View style={styles.codigoBox}>
          <Text style={styles.codigoLabel}>Código do Bolão</Text>
          <Text style={styles.codigoTexto}>{bolao.codigo}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={copiarCodigo}>
              <Text style={styles.primaryButtonText}>Copiar Código</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={compartilharConvite}
            >
              <Text style={styles.secondaryButtonText}>
                Compartilhar
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Top 3</Text>

          {ranking.length > 3 && (
            <Pressable onPress={abrirRanking}>
              <Text style={styles.verTodosText}>Ranking completo →</Text>
            </Pressable>
          )}
        </View>

        {rankingResumo.length === 0 ? (
          <Text style={styles.emptyText}>Ranking ainda não disponível.</Text>
        ) : (
          rankingResumo.map((item, index) => (
            <View key={item.participante_id} style={styles.rankingCard}>
              <View style={styles.rankingLeft}>
                <Text style={styles.medalha}>{medalha(index)}</Text>
                <View>
                  <Text style={styles.rankingNome}>{item.nome}</Text>
                  <Text style={styles.rankingDetalhe}>
                    {item.palpites_com_pontos} palpites pontuados
                  </Text>
                </View>
              </View>

              <Text style={styles.rankingPontos}>{item.total_pontos} pts</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          👥 Participantes ({participantes.length})
        </Text>

        {participantes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum participante encontrado.</Text>
        ) : (
          participantes.map((participante) => (
            <View key={participante.id} style={styles.participanteCard}>
              <Text style={styles.participanteNome}>
                👤 {nomeParticipante(participante)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F3A',
  },

  content: {
    padding: 20,
    paddingBottom: 32,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 12,
  },

  mainActions: {
    gap: 12,
    marginBottom: 20,
  },

  palpitesButton: {
    backgroundColor: '#F5C542',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },

  palpitesButtonText: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: 'bold',
  },

  rankingButton: {
    backgroundColor: '#17365D',
    borderWidth: 1,
    borderColor: '#F5C542',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },

  rankingButtonText: {
    color: '#F5C542',
    fontSize: 18,
    fontWeight: 'bold',
  },

  codigoBox: {
    backgroundColor: '#17365D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },

  codigoLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },

  codigoTexto: {
    color: '#F5C542',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 18,
  },

  actions: {
    gap: 12,
  },

  primaryButton: {
    backgroundColor: '#F5C542',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: 'bold',
  },

  secondaryButton: {
    backgroundColor: '#17365D',
    borderWidth: 1,
    borderColor: '#F5C542',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#F5C542',
    fontSize: 16,
    fontWeight: 'bold',
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#F5C542',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  verTodosText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.85,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },

  rankingCard: {
    backgroundColor: '#17365D',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  medalha: {
    color: '#FFFFFF',
    fontSize: 24,
    width: 36,
    textAlign: 'center',
  },

  rankingNome: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  rankingDetalhe: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },

  rankingPontos: {
    color: '#F5C542',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },

  participanteCard: {
    backgroundColor: '#17365D',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },

  participanteNome: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});