import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

type UsuarioApp = {
  id: string;
};

type Bolao = {
  id: string;
  nome: string;
  codigo: string;
};

type ModalTipo = 'criar' | 'entrar' | null;

export default function BolaoScreen() {
  const [usuarioApp, setUsuarioApp] = useState<UsuarioApp | null>(null);
  const [boloes, setBoloes] = useState<Bolao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [modalTipo, setModalTipo] = useState<ModalTipo>(null);
  const [nomeBolao, setNomeBolao] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');

  const fecharModal = () => {
    setModalTipo(null);
    setNomeBolao('');
    setCodigoConvite('');
  };

  const carregarUsuarioApp = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (error || !data) {
      Alert.alert('Erro', 'Não foi possível carregar o usuário.');
      return null;
    }

    setUsuarioApp(data);
    return data;
  }, []);

  const carregarBoloes = useCallback(
    async (usuarioId?: string) => {
      const idUsuario = usuarioId || usuarioApp?.id;

      if (!idUsuario) return;

      setCarregando(true);

      const { data, error } = await supabase
        .from('participantes')
        .select('boloes(id, nome, codigo)')
        .eq('usuario_id', idUsuario);


      setCarregando(false);

      if (error) {
        Alert.alert('Erro', 'Não foi possível carregar seus bolões.');
        return;
      }

      const lista =
        data
          ?.map((item: any) => {
            const bolao = Array.isArray(item.boloes)
              ? item.boloes[0]
              : item.boloes;

            return bolao;
          })
          .filter((bolao: Bolao | null) => {
            return bolao && bolao.nome && bolao.nome.trim() !== '';
          }) ?? [];

      setBoloes(lista);
    },
    [usuarioApp]
  );

  async function iniciarTela() {
    const usuario = await carregarUsuarioApp();

    if (usuario) {
      await carregarBoloes(usuario.id);
    }
  }

  useEffect(() => {
    iniciarTela();
  }, []);

  async function criarBolao() {
    const nome = nomeBolao.trim();

    if (!nome) {
      Alert.alert('Atenção', 'Informe o nome do bolão.');
      return;
    }

    if (salvando) return;

    setSalvando(true);

    try {
      const usuario = usuarioApp || (await carregarUsuarioApp());

      if (!usuario) return;

      const codigoGerado = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const { data: bolaoCriado, error: erroBolao } = await supabase
        .from('boloes')
        .insert([
          {
            nome,
            codigo: codigoGerado,
          },
        ])
        .select('id, nome, codigo')
        .single();

      if (erroBolao || !bolaoCriado) {
        Alert.alert('Erro', 'Não foi possível criar o bolão.');
        return;
      }

      const { error: erroParticipante } = await supabase
        .from('participantes')
        .insert([
          {
            usuario_id: usuario.id,
            bolao_id: bolaoCriado.id,
          },
        ]);

      if (erroParticipante) {
        Alert.alert(
          'Erro',
          'Bolão criado, mas não foi possível associar o usuário.'
        );
        return;
      }

      fecharModal();
      await carregarBoloes(usuario.id);

      Alert.alert('Bolão criado', `Código do convite: ${bolaoCriado.codigo}`);
    } finally {
      setSalvando(false);
    }
  }

  async function entrarComCodigo() {
    const codigo = codigoConvite.trim().toUpperCase();

    if (!codigo) {
      Alert.alert('Atenção', 'Informe o código do convite.');
      return;
    }

    if (salvando) return;

    setSalvando(true);

    try {
      const usuario = usuarioApp || (await carregarUsuarioApp());

      if (!usuario) return;

      const { data: bolao, error: erroBolao } = await supabase
        .from('boloes')
        .select('id, nome, codigo')
        .eq('codigo', codigo)
        .maybeSingle();

      if (erroBolao || !bolao) {
        Alert.alert(
          'Não encontrado',
          'Nenhum bolão foi encontrado com esse código.'
        );
        return;
      }

      const { error: erroParticipante } = await supabase
        .from('participantes')
        .insert([
          {
            usuario_id: usuario.id,
            bolao_id: bolao.id,
          },
        ]);

      if (erroParticipante) {
        Alert.alert(
          'Atenção',
          'Você já participa desse bolão ou não foi possível entrar.'
        );
        return;
      }

      fecharModal();
      await carregarBoloes(usuario.id);

      Alert.alert('Sucesso', `Você entrou no bolão ${bolao.nome}.`);
    } finally {
      setSalvando(false);
    }
  }

  async function copiarCodigo(codigo: string) {
    await Clipboard.setStringAsync(codigo);
    Alert.alert('Código copiado', `Código ${codigo} copiado.`);
  }

  async function compartilharConvite(bolao: Bolao) {
    const mensagem =
      `Você foi convidado para participar do bolão "${bolao.nome}" no CopaBolão 2026!\n\n` +
      `Código do convite: ${bolao.codigo}\n\n` +
      `Abra o app CopaBolão 2026, toque em "Entrar com Código" e digite esse código.`;

    await Share.share({
      message: mensagem,
    });
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={carregando} onRefresh={iniciarTela} />
        }
      >
        <Text style={styles.title}>Meus Bolões</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => setModalTipo('criar')}
        >
          <Text style={styles.primaryButtonText}>+ Criar Bolão</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => setModalTipo('entrar')}
        >
          <Text style={styles.secondaryButtonText}>🎟️ Entrar com Código</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seus bolões</Text>

          {boloes.length === 0 ? (
            <Text style={styles.emptyText}>
              Você ainda não participa de nenhum bolão.
            </Text>
          ) : (
            boloes.map((bolao) => (
              <View key={bolao.id} style={styles.card}>
                <Pressable
                  onPress={() => router.push(`/bolao/${bolao.id}` as any)}
                >
                  <Text style={styles.cardTitle}>{bolao.nome}</Text>
                  <Text style={styles.cardText}>Código: {bolao.codigo}</Text>
                </Pressable>

                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.smallButton}
                    onPress={() => copiarCodigo(bolao.codigo)}
                  >
                    <Text style={styles.smallButtonText}>Copiar</Text>
                  </Pressable>

                  <Pressable
                    style={styles.smallButtonOutline}
                    onPress={() => compartilharConvite(bolao)}
                  >
                    <Text style={styles.smallButtonOutlineText}>
                      Compartilhar
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.adBox}>
          <Text style={styles.adText}>Espaço reservado para anúncios</Text>
        </View>
      </ScrollView>

      <Modal
        visible={modalTipo !== null}
        transparent
        animationType="fade"
        onRequestClose={fecharModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {modalTipo === 'criar' ? 'Criar Bolão' : 'Entrar em Bolão'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={
                modalTipo === 'criar'
                  ? 'Nome do bolão'
                  : 'Código do convite'
              }
              placeholderTextColor="#999"
              autoCapitalize={modalTipo === 'entrar' ? 'characters' : 'sentences'}
              value={modalTipo === 'criar' ? nomeBolao : codigoConvite}
              onChangeText={
                modalTipo === 'criar' ? setNomeBolao : setCodigoConvite
              }
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={fecharModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.confirmButton,
                  salvando && styles.disabledButton,
                ]}
                disabled={salvando}
                onPress={() => {
                  if (modalTipo === 'criar') {
                    criarBolao();
                    return;
                  }

                  if (modalTipo === 'entrar') {
                    entrarComCodigo();
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>
                  {salvando
                    ? 'Aguarde...'
                    : modalTipo === 'criar'
                      ? 'Criar'
                      : 'Entrar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1F3A',
  },

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
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 24,
  },

  primaryButton: {
    backgroundColor: '#F5C542',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },

  primaryButtonText: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: 'bold',
  },

  secondaryButton: {
    backgroundColor: '#17365D',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5C542',
    marginBottom: 28,
  },

  secondaryButtonText: {
    color: '#F5C542',
    fontSize: 18,
    fontWeight: 'bold',
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: '#F5C542',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },

  card: {
    backgroundColor: '#17365D',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  cardText: {
    color: '#F5C542',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  smallButton: {
    flex: 1,
    backgroundColor: '#F5C542',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  smallButtonText: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: 'bold',
  },

  smallButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F5C542',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  smallButtonOutlineText: {
    color: '#F5C542',
    fontSize: 14,
    fontWeight: 'bold',
  },

  adBox: {
    marginTop: 8,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 24,
  },

  modalBox: {
    backgroundColor: '#0B1F3A',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F5C542',
  },

  modalTitle: {
    color: '#F5C542',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 18,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#17365D',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  confirmButton: {
    flex: 1,
    backgroundColor: '#F5C542',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  confirmButtonText: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});