import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function BolaoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Meu Bolão</Text>

      <Pressable style={styles.card}>
        <Text style={styles.cardTitle}>➕ Criar Bolão</Text>
        <Text style={styles.cardText}>
          Crie um novo bolão para seus amigos e familiares.
        </Text>
      </Pressable>

      <Pressable style={styles.card}>
        <Text style={styles.cardTitle}>🎟️ Entrar com Código</Text>
        <Text style={styles.cardText}>
          Entre em um bolão usando um código de convite.
        </Text>
      </Pressable>

      <Pressable style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Ranking</Text>
        <Text style={styles.cardText}>
          Veja sua posição e acompanhe seus concorrentes.
        </Text>
      </Pressable>

      <View style={styles.adBox}>
        <Text style={styles.adText}>
          Espaço reservado para anúncios
        </Text>
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
    marginBottom: 8,
  },

  cardText: {
    color: '#FFFFFF',
    fontSize: 16,
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