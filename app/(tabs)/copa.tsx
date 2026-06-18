import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Jogo = {
  id: string;
  api_id: string | null;
  time_casa: string;
  time_fora: string;
  data_jogo: string | null;
  fase: string | null;
  grupo: string | null;
  status: string | null;
  placar_casa: number | null;
  placar_fora: number | null;
  estadio: string | null;
  cidade: string | null;
};

function formatarData(data: string | null) {
  if (!data) return 'Data não definida';

  return new Date(data).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CopaScreen() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarJogos() {
    setCarregando(true);
    setErro('');

    const { data, error } = await supabase
      .from('jogos')
      .select('*')
      .order('data_jogo', { ascending: true });

    if (error) {
      console.log('ERRO JOGOS:', error);
      setErro(error.message || 'Não foi possível carregar os jogos.');
      setCarregando(false);
      return;
    }

    setJogos(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregarJogos();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏆 Copa do Mundo 2026</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Jogos da Copa</Text>

        {carregando && (
          <Text style={styles.cardText}>Carregando jogos...</Text>
        )}

        {!carregando && erro !== '' && (
          <Text style={styles.errorText}>{erro}</Text>
        )}

        {!carregando && erro === '' && jogos.length === 0 && (
          <Text style={styles.cardText}>
            Jogos ainda não carregados.
          </Text>
        )}

        {!carregando && erro === '' && jogos.map((jogo) => (
          <View key={jogo.id} style={styles.jogoBox}>
            <Text style={styles.dataText}>
              {formatarData(jogo.data_jogo)}
            </Text>

            <Text style={styles.jogoTitulo}>
              {jogo.time_casa} x {jogo.time_fora}
            </Text>

            <Text style={styles.cardText}>
              {jogo.fase || 'Fase não definida'}
              {jogo.grupo ? ` • Grupo ${jogo.grupo}` : ''}
            </Text>

            {(jogo.estadio || jogo.cidade) && (
              <Text style={styles.cardText}>
                {[jogo.estadio, jogo.cidade].filter(Boolean).join(' • ')}
              </Text>
            )}

            {jogo.status && jogo.status !== 'NS' && (
              <Text style={styles.placarText}>
                {jogo.placar_casa ?? '-'} x {jogo.placar_fora ?? '-'}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌎 Grupos</Text>
        <Text style={styles.cardText}>
          Em breve: grupos oficiais da Copa.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Classificação</Text>
        <Text style={styles.cardText}>
          Em breve: tabela completa da Copa.
        </Text>
      </View>

      <View style={styles.adBox}>
        <Text style={styles.adText}>Espaço reservado para anúncios</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F3A',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#17365D',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#F5C542',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 6,
  },
  dataText: {
    color: '#F5C542',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginBottom: 6,
  },
  jogoBox: {
    borderTopWidth: 1,
    borderTopColor: '#355C85',
    paddingTop: 12,
    marginTop: 12,
  },
  jogoTitulo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  placarText: {
    color: '#F5C542',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  adBox: {
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F5C542',
    borderStyle: 'dashed',
    padding: 16,
    borderRadius: 12,
  },
  adText: {
    color: '#F5C542',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});