import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  async function loginComGoogle() {
    const redirectTo = 'appcopa://auth';
    console.log('REDIRECT TO:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.log('ERRO LOGIN GOOGLE:', error);
      return;
    }

    if (!data?.url) {
      console.log('URL de login não retornada');
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    if (result.type === 'success') {
      const url = result.url;
      const params = new URLSearchParams(url.split('#')[1]);

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

    if (sessionError) {
      console.log('ERRO AO SALVAR SESSÃO:', sessionError);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('USUARIO LOGADO:', JSON.stringify(user, null, 2));

    if (user) {
      const { data: usuarioExistente } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', user.id)
        .maybeSingle();

      console.log('USUARIO EXISTENTE:', usuarioExistente);    

      if (!usuarioExistente) {
        const { data: usuarioCriado, error: erroUsuario } = await supabase
          .from('usuarios')
          .insert([
            {
              auth_id: user.id,
              email: user.email,
              nome_completo: user.user_metadata?.full_name ?? user.email,
              apelido: user.user_metadata?.name ?? null,
              foto_url: user.user_metadata?.picture ?? null,
            },
          ])
          .select();

        console.log('USUARIO CRIADO:', usuarioCriado);
        console.log('ERRO AO CRIAR USUARIO:', erroUsuario);

        if (erroUsuario) {
          console.log('ERRO AO CRIAR USUARIO:', erroUsuario);
          return;
        }
      }
    }

    router.replace('/(tabs)');
  }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CopaBolão 2026</Text>
      <Text style={styles.subtitle}>Entre para criar e participar de bolões</Text>

      <Pressable style={styles.button} onPress={loginComGoogle}>
        <Text style={styles.buttonText}>Entrar com Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#F5C542',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});