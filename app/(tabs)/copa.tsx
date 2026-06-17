import { View, Text, StyleSheet } from 'react-native';

export default function CopaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Copa do Mundo 2026</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Jogos de Hoje</Text>
        <Text style={styles.cardText}>Brasil x Sérvia - 16:00</Text>
        <Text style={styles.cardText}>Argentina x Japão - 19:00</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌎 Grupos</Text>
        <Text style={styles.cardText}>Grupo A, B, C, D...</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Classificação</Text>
        <Text style={styles.cardText}>Em breve: tabela completa da Copa.</Text>
      </View>

      <View style={styles.adBox}>
        <Text style={styles.adText}>Espaço reservado para anúncios</Text>
      </View>
    </View>
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
  adBox: {
    marginTop: 'auto',
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