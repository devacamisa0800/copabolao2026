import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function BolaoScreen() {
  const [nomeBolao, setNomeBolao] = useState('');
  const [ultimoCodigo, setUltimoCodigo] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [bolaoEntrado, setBolaoEntrado] = useState('');

async function criarBolaoTeste() {
  const codigoGerado = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const { data, error } = await supabase
    .from('boloes')
    .insert([
      {
        nome: nomeBolao,
        codigo: codigoGerado,
      },
    ])
    .select();

  console.log('BOLAO CRIADO:', data);
  console.log('ERRO:', error);

  if (data && data.length > 0) {
    setUltimoCodigo(data[0].codigo);
  }
}

async function entrarComCodigo() {
  const usuarioIdTeste = '9c915bf7-7a03-48e5-b82b-82ef4ff6726d';

  const { data: bolao, error } = await supabase
    .from('boloes')
    .select('*')
    .eq('codigo', codigoConvite.toUpperCase())
    .single();

  console.log('BOLAO ENCONTRADO:', bolao);
  console.log('ERRO:', error);

  if (bolao) {
    const { data: participante, error: erroParticipante } = await supabase
      .from('participantes')
      .insert([
        {
          bolao_id: bolao.id,
          usuario_id: usuarioIdTeste,
        },
      ])
      .select();

    console.log('PARTICIPANTE CRIADO:', participante);
    console.log('ERRO PARTICIPANTE:', erroParticipante);

    if (!erroParticipante) {
  setBolaoEntrado(bolao.nome);
}
  }
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Meu Bolão</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do bolão"
        placeholderTextColor="#999"
        value={nomeBolao}
        onChangeText={setNomeBolao}
/>

      <Pressable
        style={styles.card}
        onPress={criarBolaoTeste}
      >
        <Text style={styles.cardTitle}>➕ Criar Bolão</Text>
        <Text style={styles.cardText}>
          Crie um novo bolão para seus amigos e familiares.
        </Text>
      </Pressable>

      {ultimoCodigo !== '' && (
        <View style={styles.codigoBox}>
          <Text style={styles.codigoTitulo}>
            Código do Convite
          </Text>

          <Text style={styles.codigoTexto}>
            {ultimoCodigo}
          </Text>
        </View>
      )}

      {bolaoEntrado !== '' && (
        <View style={styles.codigoBox}>
          <Text style={styles.codigoTitulo}>
            Você entrou no bolão
          </Text>

          <Text style={styles.codigoTexto}>
            {bolaoEntrado}
          </Text>
        </View>
      )}

        <TextInput
          style={styles.input}
          placeholder="Código do convite"
          placeholderTextColor="#999"
          value={codigoConvite}
          onChangeText={setCodigoConvite}
        />

      <Pressable
        style={styles.card}
        onPress={entrarComCodigo}
      >
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

input: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 16,
  marginBottom: 16,
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
  
  codigoBox: {
  backgroundColor: '#0E2A4D',
  borderWidth: 2,
  borderColor: '#F5C542',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
},

codigoTitulo: {
  color: '#FFFFFF',
  fontSize: 16,
  textAlign: 'center',
},

codigoTexto: {
  color: '#F5C542',
  fontSize: 28,
  fontWeight: 'bold',
  textAlign: 'center',
  marginTop: 8,
},

});