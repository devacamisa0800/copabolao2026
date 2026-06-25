import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

type RankingItem = {
  participante_id: string;
  usuario_id: string;
  nome: string;
  foto_url: string | null;
  total_pontos: number;
  palpites_com_pontos: number;
};

export default function RankingScreen() {
  const { bolaoId } = useLocalSearchParams<{ bolaoId: string }>();

  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregarRanking = useCallback(async () => {
    if (!bolaoId) return;

    setCarregando(true);

    const { data, error } = await supabase.rpc('ranking_bolao', {
      bolao_uuid: bolaoId,
    });

    setCarregando(false);

    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar o ranking.');
      return;
    }

    setRanking((data ?? []) as RankingItem[]);
  }, [bolaoId]);

  useEffect(() => {
    carregarRanking();
  }, [carregarRanking]);

  function medalha(posicao: number) {
    if (posicao === 0) return '🥇';
    if (posicao === 1) return '🥈';
    if (posicao === 2) return '🥉';

    return `${posicao + 1}º`;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={carregando} onRefresh={carregarRanking} />
      }
    >
      <Text style={styles.title}>🏆 Ranking</Text>
      <Text style={styles.subtitle}>Classificação atual do bolão</Text>

      {ranking.length === 0 ? (
        <Text style={styles.emptyText}>Ranking ainda não disponível.</Text>
      ) : (
        ranking.map((item, index) => (
          <View
            key={item.participante_id}
            style={[
              styles.card,
              index === 0 && styles.primeiroLugar,
            ]}
          >
            <View style={styles.left}>
              <Text style={styles.medalha}>{medalha(index)}</Text>

              <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.detalhe}>
                  {item.palpites_com_pontos} palpites pontuados
                </Text>
              </View>
            </View>

            <View style={styles.pontosBox}>
              <Text style={styles.pontos}>{item.total_pontos}</Text>
              <Text style={styles.pontosLabel}>pts</Text>
            </View>
          </View>
        ))
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
    padding: 20,
    paddingBottom: 32,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 24,
  },

  subtitle: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 8,
    marginBottom: 24,
  },

  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 32,
  },

  card: {
    backgroundColor: '#17365D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  primeiroLugar: {
    borderWidth: 1,
    borderColor: '#F5C542',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  medalha: {
    color: '#FFFFFF',
    fontSize: 26,
    width: 40,
    textAlign: 'center',
  },

  info: {
    flex: 1,
  },

  nome: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  detalhe: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.72,
    marginTop: 3,
  },

  pontosBox: {
    alignItems: 'center',
    marginLeft: 12,
  },

  pontos: {
    color: '#F5C542',
    fontSize: 24,
    fontWeight: 'bold',
  },

  pontosLabel: {
    color: '#F5C542',
    fontSize: 13,
    fontWeight: 'bold',
  },
});