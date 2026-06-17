import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 WorldCup 2026</Text>
      <Text style={styles.title}>⚽ A Camisa 0800</Text>

      <Text style={styles.subtitle}>
        Acompanhe a Copa do Mundo e participe do bolão com seus amigos.
      </Text>

      <Pressable style={styles.button}
      onPress={() => router.push('/copa')}
      >
        <Text style={styles.buttonText}>Copa do Mundo</Text>
      </Pressable>

      <Pressable style={styles.buttonSecondary}
      onPress={() => router.push('/bolao')}
      >
        <Text style={styles.buttonSecondaryText}>Meu Bolão</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#0B1F3A',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#DDE6F2',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#F5C542',
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  buttonText: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonSecondary: {
    borderColor: '#F5C542',
    borderWidth: 2,
    padding: 18,
    borderRadius: 14,
  },
  buttonSecondaryText: {
    color: '#F5C542',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});