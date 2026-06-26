import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(false);

  const garantirUsuarioApp = useCallback(async (user: any) => {
    if (!user) return;

    const { data: usuarioExistente, error: erroBusca } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (erroBusca) {
      console.log('ERRO AO BUSCAR USUARIO:', erroBusca);
      return;
    }

    if (usuarioExistente) return;

    const { error: erroUsuario } = await supabase.from('usuarios').insert([
      {
        auth_id: user.id,
        email: user.email,
        nome_completo: user.user_metadata?.full_name ?? user.email,
        apelido: user.user_metadata?.name ?? null,
        foto_url: user.user_metadata?.picture ?? null,
      },
    ]);

    if (erroUsuario) {
      console.log('ERRO AO CRIAR USUARIO:', erroUsuario);
    }
  }, []);

  useEffect(() => {
    async function carregarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await garantirUsuarioApp(session.user);
      }

      setLogado(!!session);
      setCarregando(false);
    }

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await garantirUsuarioApp(session.user);
      }

      setLogado(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [garantirUsuarioApp]);

  useEffect(() => {
    if (carregando) return;

    const rotaAtual = segments[0];
    const estaNoLogin = rotaAtual === 'login';

    if (!logado && !estaNoLogin) {
      router.replace('/login');
      return;
    }

    if (logado && estaNoLogin) {
      router.replace('/(tabs)');
    }
  }, [carregando, logado, segments, router]);

  if (carregando) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0B1F3A',
          },
          headerTintColor: '#F5C542',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          headerBackTitle: 'Voltar',
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#0B1F3A',
          },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="bolao/[id]"
          options={{
            title: 'Bolão',
          }}
        />

        <Stack.Screen
          name="palpites/[bolaoId]"
          options={{
            title: 'Palpites',
          }}
        />

        <Stack.Screen
          name="ranking/[bolaoId]"
          options={{
            title: 'Ranking',
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Modal',
          }}
        />
      </Stack>

      <StatusBar style="light" />
    </ThemeProvider>
  );
}