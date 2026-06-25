import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    async function carregarSessao() {

      await supabase.auth.signOut();
      console.log('SESSAO APAGADA');

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('SESSAO ATUAL:', session?.user?.email);

      setLogado(!!session);
      setCarregando(false);
    }

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            console.log('AUTH USER:', session.user.email);

            const { data: usuarioExistente } = await supabase
              .from('usuarios')
              .select('*')
              .eq('auth_id', session.user.id)
              .maybeSingle();

            console.log('USUARIO EXISTENTE:', usuarioExistente);

            if (!usuarioExistente) {
              const { data: usuarioCriado, error: erroUsuario } = await supabase
                .from('usuarios')
                .insert([
                  {
                    auth_id: session.user.id,
                    email: session.user.email,
                    nome_completo:
                      session.user.user_metadata?.full_name ?? session.user.email,
                    apelido: session.user.user_metadata?.name ?? null,
                    foto_url: session.user.user_metadata?.picture ?? null,
                  },
                ])
                .select();

              console.log('USUARIO CRIADO:', usuarioCriado);
              console.log('ERRO AO CRIAR USUARIO:', erroUsuario);
             }
          }

          setLogado(!!session);
        });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (carregando) return;

    const rotaAtual = segments[0];
    const estaNoLogin = rotaAtual === 'login';

    if (!logado && !estaNoLogin) {
      router.replace('/login');
    }

    if (logado && estaNoLogin) {
      router.replace('/(tabs)');
    }
  }, [carregando, logado, segments]);

  if (carregando) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}