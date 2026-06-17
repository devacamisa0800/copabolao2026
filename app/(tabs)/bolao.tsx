import { View, Text, StyleSheet } from 'react-native';

export default function BolaoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Meu Bolão</Text>
      <Text style={styles.text}>
        Em breve: palpites, ranking e pontuação.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
  },
});