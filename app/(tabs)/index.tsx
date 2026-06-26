import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

type Usuario = {
  nome_completo: string | null;
  email: string | null;
};

export default function HomeScreen() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUsuario({
        nome_completo: user.user_metadata?.full_name ?? null,
        email: user.email ?? null,
      });
    }

    carregarUsuario();
  }, []);

  async function sair() {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  }

  const primeiroNome =
    usuario?.nome_completo?.split(' ')[0] || usuario?.email || 'usuário';

  return (
    <View style={styles.container}>
      <Pressable style={styles.logoutButton} onPress={sair}>
        <Text style={styles.logoutText}>↪︎ Sair</Text>
      </Pressable>

      <Text style={styles.trophy}>🏆</Text>

      <Text style={styles.brand}>A Camisa 0800</Text>

      <Text style={styles.product}>⚽ Bolão da Copa 2026</Text>

      <Text style={styles.welcome}>Bem-vindo!</Text>

      <Text style={styles.userName}>{primeiroNome}</Text>

      <Text style={styles.subtitle}>
        Acompanhe a Copa do Mundo e participe dos bolões com seus amigos.
      </Text>

      <Pressable style={styles.button} onPress={() => router.push('/copa')}>
        <Text style={styles.buttonText}>⚽ Copa do Mundo</Text>
      </Pressable>

      <Pressable
        style={styles.buttonSecondary}
        onPress={() => router.push('/bolao')}
      >
        <Text style={styles.buttonSecondaryText}>🏆 Meus Bolões</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 150,
    paddingBottom: 40,
    backgroundColor: '#0B1F3A',
  },

  logoutButton: {
    position: 'absolute',
    bottom: 28,
    right: 24,
  },

  logoutText: {
  color: '#DDE6F2',
  fontSize: 16,
  fontWeight: '600',
  },

  trophy: {
    fontSize: 42,
    textAlign: 'center',
    marginBottom: 12,
  },

  brand: {
    fontSize: 22,
    fontWeight: '600',
    color: '#DDE6F2',
    textAlign: 'center',
    marginBottom: 8,
  },

  product: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 60,
  },

  welcome: {
    fontSize: 20,
    color: '#DDE6F2',
    textAlign: 'center',
    marginBottom: 6,
  },

  userName: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#F5C542',
  textAlign: 'center',
  marginBottom: 18,
  },

  subtitle: {
    fontSize: 18,
    color: '#DDE6F2',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
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