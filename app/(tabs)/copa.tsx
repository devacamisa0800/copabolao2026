import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Jogo = {
  id: string;
  api_id: string | null;
  time_casa: string;
  time_fora: string;
  data_jogo: string | null;
  fase: string | null;
  grupo: string | null;
  status: string | null;
  placar_casa: number | null;
  placar_fora: number | null;
  estadio: string | null;
  cidade: string | null;
};

type Grupo = {
  id: string;
  grupo: string;
  selecao: string;
  pontos: number | null;
  jogos: number | null;
  vitorias: number | null;
  empates: number | null;
  derrotas: number | null;
  gols_pro: number | null;
  gols_contra: number | null;
  saldo: number | null;
};

type SecaoAtiva =
  | 'home'
  | 'jogos'
  | 'grupos'
  | 'classificacao'
  | 'estatisticas'
  | 'detalheJogo';

function formatarData(data: string | null) {
  if (!data) return 'Data não definida';

  const dataObj = new Date(data);

  const dia = dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const hora = dataObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dia} • ${hora}`;
}

function traduzirFase(fase: string | null) {
  switch (fase) {
    case 'group-stage':
      return 'Fase de Grupos';
    case 'round-of-32':
      return '16 avos de final';
    case 'round-of-16':
      return 'Oitavas de Final';
    case 'quarter-finals':
      return 'Quartas de Final';
    case 'semi-finals':
      return 'Semifinal';
    case 'third-place':
      return 'Disputa de 3º lugar';
    case 'final':
      return 'Final';
    default:
      return fase || 'Fase não definida';
  }
}

function formatarCidade(cidade: string | null) {
  if (!cidade) return '';

  return cidade
    .replace(/-/g, ' ')
    .split(' ')
    .map((palavra) => {
      if (!palavra) return '';
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}

const paises: Record<string, { nome: string; bandeira: string }> = {
  'South Africa': { nome: 'África do Sul', bandeira: '🇿🇦' },
  Germany: { nome: 'Alemanha', bandeira: '🇩🇪' },
  Algeria: { nome: 'Argélia', bandeira: '🇩🇿' },
  Argentina: { nome: 'Argentina', bandeira: '🇦🇷' },
  'Saudi Arabia': { nome: 'Arábia Saudita', bandeira: '🇸🇦' },
  Austria: { nome: 'Áustria', bandeira: '🇦🇹' },
  Australia: { nome: 'Austrália', bandeira: '🇦🇺' },
  Belgium: { nome: 'Bélgica', bandeira: '🇧🇪' },
  Brazil: { nome: 'Brasil', bandeira: '🇧🇷' },
  'Bosnia and Herzegovina': { nome: 'Bósnia', bandeira: '🇧🇦' },
  'Cape Verde': { nome: 'Cabo Verde', bandeira: '🇨🇻' },
  Canada: { nome: 'Canadá', bandeira: '🇨🇦' },
  Qatar: { nome: 'Catar', bandeira: '🇶🇦' },
  Colombia: { nome: 'Colômbia', bandeira: '🇨🇴' },
  'Korea Republic': { nome: 'Coreia do Sul', bandeira: '🇰🇷' },
  'South Korea': { nome: 'Coreia do Sul', bandeira: '🇰🇷' },
  'Ivory Coast': { nome: 'Costa do Marfim', bandeira: '🇨🇮' },
  "Cote d'Ivoire": { nome: 'Costa do Marfim', bandeira: '🇨🇮' },
  "Côte d'Ivoire": { nome: 'Costa do Marfim', bandeira: '🇨🇮' },
  Croatia: { nome: 'Croácia', bandeira: '🇭🇷' },
  Curacao: { nome: 'Curaçao', bandeira: '🇨🇼' },
  Curaçao: { nome: 'Curaçao', bandeira: '🇨🇼' },
  Egypt: { nome: 'Egito', bandeira: '🇪🇬' },
  Ecuador: { nome: 'Equador', bandeira: '🇪🇨' },
  Scotland: { nome: 'Escócia', bandeira: '🏴' },
  Spain: { nome: 'Espanha', bandeira: '🇪🇸' },
  'United States': { nome: 'Estados Unidos', bandeira: '🇺🇸' },
  USA: { nome: 'Estados Unidos', bandeira: '🇺🇸' },
  France: { nome: 'França', bandeira: '🇫🇷' },
  Ghana: { nome: 'Gana', bandeira: '🇬🇭' },
  Haiti: { nome: 'Haiti', bandeira: '🇭🇹' },
  Netherlands: { nome: 'Holanda', bandeira: '🇳🇱' },
  England: { nome: 'Inglaterra', bandeira: '🏴' },
  Iran: { nome: 'Irã', bandeira: '🇮🇷' },
  'IR Iran': { nome: 'Irã', bandeira: '🇮🇷' },
  Iraq: { nome: 'Iraque', bandeira: '🇮🇶' },
  Japan: { nome: 'Japão', bandeira: '🇯🇵' },
  Jordan: { nome: 'Jordânia', bandeira: '🇯🇴' },
  Morocco: { nome: 'Marrocos', bandeira: '🇲🇦' },
  Mexico: { nome: 'México', bandeira: '🇲🇽' },
  Norway: { nome: 'Noruega', bandeira: '🇳🇴' },
  'New Zealand': { nome: 'Nova Zelândia', bandeira: '🇳🇿' },
  Panama: { nome: 'Panamá', bandeira: '🇵🇦' },
  Paraguay: { nome: 'Paraguai', bandeira: '🇵🇾' },
  Portugal: { nome: 'Portugal', bandeira: '🇵🇹' },
  'Congo DR': { nome: 'RD Congo', bandeira: '🇨🇩' },
  'DR Congo': { nome: 'RD Congo', bandeira: '🇨🇩' },
  'Democratic Republic of the Congo': { nome: 'RD Congo', bandeira: '🇨🇩' },
  Czechia: { nome: 'Chéquia', bandeira: '🇨🇿' },
  Senegal: { nome: 'Senegal', bandeira: '🇸🇳' },
  Sweden: { nome: 'Suécia', bandeira: '🇸🇪' },
  Switzerland: { nome: 'Suíça', bandeira: '🇨🇭' },
  Tunisia: { nome: 'Tunísia', bandeira: '🇹🇳' },
  Turkey: { nome: 'Turquia', bandeira: '🇹🇷' },
  Turkiye: { nome: 'Turquia', bandeira: '🇹🇷' },
  Türkiye: { nome: 'Turquia', bandeira: '🇹🇷' },
  Uruguay: { nome: 'Uruguai', bandeira: '🇺🇾' },
  Uzbekistan: { nome: 'Uzbequistão', bandeira: '🇺🇿' },
};

const bandeirasPorNome: Record<string, string> = {
  'África do Sul': '🇿🇦',
  Alemanha: '🇩🇪',
  'Arábia Saudita': '🇸🇦',
  Argélia: '🇩🇿',
  Argentina: '🇦🇷',
  Austrália: '🇦🇺',
  Áustria: '🇦🇹',
  Bélgica: '🇧🇪',
  Bósnia: '🇧🇦',
  Brasil: '🇧🇷',
  'Cabo Verde': '🇨🇻',
  Canadá: '🇨🇦',
  Catar: '🇶🇦',
  Chéquia: '🇨🇿',
  Colômbia: '🇨🇴',
  'Coreia do Sul': '🇰🇷',
  'Costa do Marfim': '🇨🇮',
  Croácia: '🇭🇷',
  Curaçao: '🇨🇼',
  Egito: '🇪🇬',
  Equador: '🇪🇨',
  Escócia: '🏴',
  Espanha: '🇪🇸',
  'Estados Unidos': '🇺🇸',
  França: '🇫🇷',
  Gana: '🇬🇭',
  Haiti: '🇭🇹',
  Holanda: '🇳🇱',
  Inglaterra: '🏴',
  Irã: '🇮🇷',
  Iraque: '🇮🇶',
  Japão: '🇯🇵',
  Jordânia: '🇯🇴',
  Marrocos: '🇲🇦',
  México: '🇲🇽',
  Noruega: '🇳🇴',
  'Nova Zelândia': '🇳🇿',
  Panamá: '🇵🇦',
  Paraguai: '🇵🇾',
  Portugal: '🇵🇹',
  'RD Congo': '🇨🇩',
  Senegal: '🇸🇳',
  Suécia: '🇸🇪',
  Suíça: '🇨🇭',
  Tunísia: '🇹🇳',
  Turquia: '🇹🇷',
  Uruguai: '🇺🇾',
  Uzbequistão: '🇺🇿',
};

function traduzirPais(nome: string) {
  return paises[nome]?.nome || nome;
}

function bandeiraPais(nome: string) {
  return bandeirasPorNome[nome] || paises[nome]?.bandeira || '🏳️';
}

export default function CopaScreen() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemSync, setMensagemSync] = useState('');
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoAtiva>('home');
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null);

  async function carregarDados() {
    setCarregando(true);
    setErro('');

    const { data: jogosData, error: jogosError } = await supabase
      .from('jogos')
      .select('*')
      .order('data_jogo', { ascending: true });

    if (jogosError) {
      console.log('ERRO JOGOS:', jogosError);
      setErro(jogosError.message || 'Não foi possível carregar os jogos.');
      setCarregando(false);
      return;
    }

    const { data: gruposData, error: gruposError } = await supabase
      .from('grupos')
      .select('*')
      .order('grupo')
      .order('pontos', { ascending: false })
      .order('saldo', { ascending: false })
      .order('gols_pro', { ascending: false });

    if (gruposError) {
      console.log('ERRO GRUPOS:', gruposError);
    }

    setJogos(jogosData || []);
    setGrupos(gruposData || []);
    setCarregando(false);
  }

  async function atualizarCopa() {
    try {
      setSincronizando(true);
      setMensagemSync('');

      const { error } = await supabase.functions.invoke('sync_world_cup');

      if (error) {
        throw error;
      }

      await carregarDados();

      setMensagemSync('Copa atualizada com sucesso.');
    } catch (e: any) {
      console.error(e);
      setMensagemSync(e?.message ?? 'Erro ao atualizar a Copa.');
    } finally {
      setSincronizando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const agora = new Date();

  const proximosJogos = jogos
    .filter(
      (jogo) =>
        jogo.data_jogo &&
        new Date(jogo.data_jogo).getTime() >= agora.getTime()
    )
    .slice(0, 5);

  const jogosExibidos = jogos.slice(0, 30);
  const letrasGrupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  function renderBotaoHome(
    secao: SecaoAtiva,
    titulo: string,
    descricao: string
  ) {
    return (
      <Pressable
        style={styles.menuCard}
        onPress={() => setSecaoAtiva(secao)}
      >
        <Text style={styles.cardTitle}>{titulo}</Text>
        <Text style={styles.cardText}>{descricao}</Text>
      </Pressable>
    );
  }

  function renderBotaoVoltar() {
    return (
      <Pressable
        style={styles.voltarBotao}
        onPress={() => {
          setJogoSelecionado(null);
          setSecaoAtiva('home');
        }}
      >
        <Text style={styles.voltarTexto}>← Voltar</Text>
      </Pressable>
    );
  }

  function renderBotaoVoltarJogos() {
    return (
      <Pressable
        style={styles.voltarBotao}
        onPress={() => {
          setJogoSelecionado(null);
          setSecaoAtiva('jogos');
        }}
      >
        <Text style={styles.voltarTexto}>← Voltar para jogos</Text>
      </Pressable>
    );
  }

  function renderJogo(jogo: Jogo) {
    const local = [jogo.estadio, formatarCidade(jogo.cidade)]
      .filter(Boolean)
      .join(' • ');

    return (
      <Pressable
        key={jogo.id}
        style={styles.jogoBox}
        onPress={() => {
          setJogoSelecionado(jogo);
          setSecaoAtiva('detalheJogo');
        }}
      >
        <Text style={styles.dataText}>{formatarData(jogo.data_jogo)}</Text>

        <Text style={styles.jogoTitulo}>
          {traduzirPais(jogo.time_casa)} x {traduzirPais(jogo.time_fora)}
        </Text>

        <Text style={styles.cardText}>
          {traduzirFase(jogo.fase)}
          {jogo.grupo ? ` • Grupo ${jogo.grupo}` : ''}
        </Text>

        {local !== '' && <Text style={styles.localText}>{local}</Text>}

        {jogo.status && jogo.status !== 'NS' && (
          <Text style={styles.placarText}>
            {jogo.placar_casa ?? '-'} x {jogo.placar_fora ?? '-'}
          </Text>
        )}
      </Pressable>
    );
  }

  function renderGrupo(letra: string) {
    const selecoes = grupos.filter((item) => item.grupo === letra);

    return (
      <View key={letra} style={styles.grupoBox}>
        <Text style={styles.grupoTitulo}>Grupo {letra}</Text>

        <View style={styles.grupoCabecalho}>
          <Text style={styles.grupoCabecalhoTime}>Seleção</Text>

          <View style={styles.grupoNumeros}>
            <Text style={styles.grupoCabecalhoNumero}>Pts</Text>
            <Text style={styles.grupoCabecalhoNumero}>J</Text>
            <Text style={styles.grupoCabecalhoNumero}>V</Text>
            <Text style={styles.grupoCabecalhoNumero}>E</Text>
            <Text style={styles.grupoCabecalhoNumero}>D</Text>
            <Text style={styles.grupoCabecalhoNumero}>SG</Text>
          </View>
        </View>

        {selecoes.length === 0 ? (
          <Text style={styles.cardText}>Nenhuma seleção cadastrada.</Text>
        ) : (
          selecoes.map((time) => (
            <View key={time.id} style={styles.grupoLinha}>
              <Text style={styles.grupoSelecao}>
                {bandeiraPais(time.selecao)} {traduzirPais(time.selecao)}
              </Text>

              <View style={styles.grupoNumeros}>
                <Text style={styles.grupoNumero}>{time.pontos ?? 0}</Text>
                <Text style={styles.grupoNumero}>{time.jogos ?? 0}</Text>
                <Text style={styles.grupoNumero}>{time.vitorias ?? 0}</Text>
                <Text style={styles.grupoNumero}>{time.empates ?? 0}</Text>
                <Text style={styles.grupoNumero}>{time.derrotas ?? 0}</Text>
                <Text style={styles.grupoNumero}>{time.saldo ?? 0}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    );
  }

  function renderHome() {
    return (
      <>
        {renderBotaoHome(
          'jogos',
          '📅 Jogos da Copa',
          `${jogos.length} partidas da Copa 2026`
        )}

        {renderBotaoHome(
          'grupos',
          '🌎 Grupos',
          'Veja os grupos oficiais da Copa'
        )}

        {renderBotaoHome(
          'estatisticas',
          '📊 Estatísticas',
          'Veja os principais números da Copa'
        )}
      </>
    );
  }

  function renderJogos() {
    return (
      <>
        {renderBotaoVoltar()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏭️ Próximos Jogos</Text>

          {proximosJogos.length === 0 ? (
            <Text style={styles.cardText}>Nenhum próximo jogo encontrado.</Text>
          ) : (
            proximosJogos.map(renderJogo)
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Todos os Jogos ({jogos.length})</Text>

          {jogosExibidos.map(renderJogo)}

          <Text style={styles.infoText}>
            Exibindo 30 de {jogos.length} jogos.
          </Text>
        </View>
      </>
    );
  }

  function renderGrupos() {
    return (
      <>
        {renderBotaoVoltar()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌎 Grupos</Text>
          {letrasGrupos.map(renderGrupo)}
        </View>
      </>
    );
  }

  function renderClassificacao() {
    return (
      <>
        {renderBotaoVoltar()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Classificação</Text>

          {letrasGrupos.map((letra) => {
            const selecoes = grupos.filter((item) => item.grupo === letra);

            return (
              <View key={letra} style={styles.grupoBox}>
                <Text style={styles.grupoTitulo}>Grupo {letra}</Text>

                <View style={styles.grupoCabecalho}>
                  <Text style={styles.grupoCabecalhoTime}>Seleção</Text>

                  <View style={styles.grupoNumeros}>
                    <Text style={styles.grupoCabecalhoNumero}>Pts</Text>
                    <Text style={styles.grupoCabecalhoNumero}>J</Text>
                    <Text style={styles.grupoCabecalhoNumero}>V</Text>
                    <Text style={styles.grupoCabecalhoNumero}>SG</Text>
                  </View>
                </View>

                {selecoes.map((time) => (
                  <View key={time.id} style={styles.grupoLinha}>
                    <Text style={styles.grupoSelecao}>{time.selecao}</Text>

                    <View style={styles.grupoNumeros}>
                      <Text style={styles.grupoNumero}>{time.pontos ?? 0}</Text>
                      <Text style={styles.grupoNumero}>{time.jogos ?? 0}</Text>
                      <Text style={styles.grupoNumero}>{time.vitorias ?? 0}</Text>
                      <Text style={styles.grupoNumero}>{time.saldo ?? 0}</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </>
    );
  }

  function calcularMelhorAtaque() {
    const selecoesComGols = grupos.filter(
      (time) => (time.gols_pro ?? 0) > 0
    );

    const ordenado = [...selecoesComGols].sort(
      (a, b) => (b.gols_pro ?? 0) - (a.gols_pro ?? 0)
    );

    return ordenado[0];
  }

  function calcularMelhorDefesa() {
    const selecoesComJogos = grupos.filter((time) => (time.jogos ?? 0) > 0);

    const ordenado = [...selecoesComJogos].sort(
      (a, b) => (a.gols_contra ?? 0) - (b.gols_contra ?? 0)
    );

    return ordenado[0];
  }

  function calcularMaiorSaldo() {
    const selecoesComJogos = grupos.filter((time) => (time.jogos ?? 0) > 0);

    const ordenado = [...selecoesComJogos].sort(
      (a, b) => (b.saldo ?? 0) - (a.saldo ?? 0)
    );

    return ordenado[0];
  }

  function calcularJogoMaisGols() {
    const jogosComPlacar = jogos.filter(
      (jogo) => jogo.placar_casa !== null && jogo.placar_fora !== null
    );

    const ordenado = [...jogosComPlacar].sort(
      (a, b) =>
        ((b.placar_casa ?? 0) + (b.placar_fora ?? 0)) -
        ((a.placar_casa ?? 0) + (a.placar_fora ?? 0))
    );

    return ordenado[0];
  }

  function calcularTopAtaques() {
    return [...grupos]
      .filter((time) => (time.gols_pro ?? 0) > 0)
      .sort((a, b) => (b.gols_pro ?? 0) - (a.gols_pro ?? 0))
      .slice(0, 5);
  }

  function calcularTopDefesas() {
    return [...grupos]
      .filter((time) => (time.jogos ?? 0) > 0)
      .sort((a, b) => (a.gols_contra ?? 0) - (b.gols_contra ?? 0))
      .slice(0, 5);
  }

  function calcularTopSaldos() {
    return [...grupos]
      .filter((time) => (time.jogos ?? 0) > 0)
      .sort((a, b) => (b.saldo ?? 0) - (a.saldo ?? 0))
      .slice(0, 5);
  }

  function renderEstatisticas() {
    const melhorAtaque = calcularMelhorAtaque();
    const melhorDefesa = calcularMelhorDefesa();
    const maiorSaldo = calcularMaiorSaldo();
    const jogoMaisGols = calcularJogoMaisGols();
    const topAtaques = calcularTopAtaques();
    const topDefesas = calcularTopDefesas();
    const topSaldos = calcularTopSaldos();

    return (
      <>
        {renderBotaoVoltar()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Estatísticas da Copa</Text>

          <View style={styles.jogoBox}>
            <Text style={styles.cardText}>Melhor ataque</Text>

            <Text style={styles.jogoTitulo}>
              {melhorAtaque
                ? `${bandeiraPais(melhorAtaque.selecao)} ${traduzirPais(
                    melhorAtaque.selecao
                  )}`
                : 'Aguardando resultados'}
            </Text>

            {melhorAtaque && (
              <Text style={styles.infoText}>
                {melhorAtaque.gols_pro ?? 0} gols marcados
              </Text>
            )}
          </View>

          <View style={styles.jogoBox}>
            <Text style={styles.cardText}>Melhor defesa</Text>

            <Text style={styles.jogoTitulo}>
              {melhorDefesa
                ? `${bandeiraPais(melhorDefesa.selecao)} ${traduzirPais(
                    melhorDefesa.selecao
                  )}`
                : 'Aguardando resultados'}
            </Text>

            {melhorDefesa && (
              <Text style={styles.infoText}>
                {melhorDefesa.gols_contra ?? 0} gols sofridos
              </Text>
            )}
          </View>

          <View style={styles.jogoBox}>
            <Text style={styles.cardText}>Maior saldo de gols</Text>

            <Text style={styles.jogoTitulo}>
              {maiorSaldo
                ? `${bandeiraPais(maiorSaldo.selecao)} ${traduzirPais(
                    maiorSaldo.selecao
                  )}`
                : 'Aguardando resultados'}
            </Text>

            {maiorSaldo && (
              <Text style={styles.infoText}>
                Saldo {maiorSaldo.saldo ?? 0}
              </Text>
            )}
          </View>

          <View style={styles.jogoBox}>
            <Text style={styles.cardText}>Jogo com mais gols</Text>

            {jogoMaisGols ? (
              <>
                <Text style={styles.jogoTitulo}>
                  {traduzirPais(jogoMaisGols.time_casa)}{' '}
                  {jogoMaisGols.placar_casa} x {jogoMaisGols.placar_fora}{' '}
                  {traduzirPais(jogoMaisGols.time_fora)}
                </Text>

                <Text style={styles.infoText}>
                  {(jogoMaisGols.placar_casa ?? 0) +
                    (jogoMaisGols.placar_fora ?? 0)}{' '}
                  gols na partida
                </Text>
              </>
            ) : (
              <Text style={styles.infoText}>
                Nenhum jogo finalizado encontrado
              </Text>
            )}
          </View>

          <View style={styles.jogoBox}>
            <Text style={styles.cardTitle}>🏅 Rankings</Text>

            <Text style={styles.cardText}>Top 5 ataques</Text>
            {topAtaques.length > 0 ? (
              topAtaques.map((time, index) => (
                <Text key={`ataque-${time.id}`} style={styles.infoText}>
                  {index + 1}. {bandeiraPais(time.selecao)}{' '}
                  {traduzirPais(time.selecao)} — {time.gols_pro ?? 0} gols
                </Text>
              ))
            ) : (
              <Text style={styles.cardText}>Aguardando resultados</Text>
            )}

            <Text style={styles.cardText}>Top 5 defesas</Text>
            {topDefesas.length > 0 ? (
              topDefesas.map((time, index) => (
                <Text key={`defesa-${time.id}`} style={styles.infoText}>
                  {index + 1}. {bandeiraPais(time.selecao)}{' '}
                  {traduzirPais(time.selecao)} — {time.gols_contra ?? 0} gols sofridos
                </Text>
              ))
            ) : (
              <Text style={styles.cardText}>Aguardando resultados</Text>
            )}

            <Text style={styles.cardText}>Top 5 saldos</Text>
            {topSaldos.length > 0 ? (
              topSaldos.map((time, index) => (
                <Text key={`saldo-${time.id}`} style={styles.infoText}>
                  {index + 1}. {bandeiraPais(time.selecao)}{' '}
                  {traduzirPais(time.selecao)} — saldo {time.saldo ?? 0}
                </Text>
              ))
            ) : (
              <Text style={styles.cardText}>Aguardando resultados</Text>
            )}
          </View>
        </View>
      </>
    );
  }

  function renderDetalheJogo() {
    if (!jogoSelecionado) {
      return (
        <>
          {renderBotaoVoltar()}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Jogo não encontrado</Text>
            <Text style={styles.cardText}>
              Selecione um jogo novamente para ver os detalhes.
            </Text>
          </View>
        </>
      );
    }

    const local = [jogoSelecionado.estadio, formatarCidade(jogoSelecionado.cidade)]
      .filter(Boolean)
      .join(' • ');

    return (
      <>
        {renderBotaoVoltarJogos()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Detalhes do Jogo</Text>

          <View style={styles.detalheConfronto}>
            <Text style={styles.detalheTime}>
              {bandeiraPais(jogoSelecionado.time_casa)}{' '}
              {traduzirPais(jogoSelecionado.time_casa)}
            </Text>

            <Text style={styles.detalheVersus}>x</Text>

            <Text style={styles.detalheTime}>
              {bandeiraPais(jogoSelecionado.time_fora)}{' '}
              {traduzirPais(jogoSelecionado.time_fora)}
            </Text>
          </View>

          {jogoSelecionado.status && jogoSelecionado.status !== 'NS' ? (
            <Text style={styles.placarDetalhe}>
              {jogoSelecionado.placar_casa ?? '-'} x{' '}
              {jogoSelecionado.placar_fora ?? '-'}
            </Text>
          ) : (
            <Text style={styles.infoText}>Placar ainda não disponível</Text>
          )}

          <View style={styles.jogoBox}>
            <Text style={styles.detalheLabel}>Data e hora</Text>
            <Text style={styles.cardText}>
              {formatarData(jogoSelecionado.data_jogo)}
            </Text>

            <Text style={styles.detalheLabel}>Fase</Text>
            <Text style={styles.cardText}>
              {traduzirFase(jogoSelecionado.fase)}
            </Text>

            {jogoSelecionado.grupo && (
              <>
                <Text style={styles.detalheLabel}>Grupo</Text>
                <Text style={styles.cardText}>Grupo {jogoSelecionado.grupo}</Text>
              </>
            )}

            {local !== '' && (
              <>
                <Text style={styles.detalheLabel}>Local</Text>
                <Text style={styles.cardText}>{local}</Text>
              </>
            )}

            <Text style={styles.detalheLabel}>Status</Text>
            <Text style={styles.cardText}>
              {jogoSelecionado.status || 'Não iniciado'}
            </Text>
          </View>
        </View>
      </>
    );
  }

  function renderConteudo() {
    if (carregando) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardText}>Carregando dados...</Text>
        </View>
      );
    }

    if (erro !== '') {
      return (
        <View style={styles.card}>
          <Text style={styles.errorText}>{erro}</Text>
        </View>
      );
    }

    if (secaoAtiva === 'jogos') return renderJogos();
    if (secaoAtiva === 'grupos') return renderGrupos();
    if (secaoAtiva === 'classificacao') return renderClassificacao();
    if (secaoAtiva === 'estatisticas') return renderEstatisticas();
    if (secaoAtiva === 'detalheJogo') return renderDetalheJogo();

    return renderHome();
  }

return (
  <ScrollView style={styles.container}>
    <Text style={styles.title}>🏆 Copa do Mundo 2026</Text>

    <Pressable
      style={styles.botaoAtualizar}
      onPress={atualizarCopa}
      disabled={sincronizando}
    >
      <Text style={styles.botaoAtualizarTexto}>
        {sincronizando ? 'Atualizando Copa...' : '🔄 Atualizar Copa'}
      </Text>
    </Pressable>

    {mensagemSync !== '' && (
      <Text style={styles.infoText}>{mensagemSync}</Text>
    )}

    {renderConteudo()}

    <View style={styles.adBox}>
      <Text style={styles.adText}>Espaço reservado para anúncios</Text>
    </View>
  </ScrollView>
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

  menuCard: {
    backgroundColor: '#17365D',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
  },

  botaoAtualizar: {
    backgroundColor: '#F5C542',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  botaoAtualizarTexto: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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

  localText: {
    color: '#D6E4F0',
    fontSize: 14,
    marginBottom: 6,
  },

  dataText: {
    color: '#F5C542',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginBottom: 6,
  },

  voltarBotao: {
    marginBottom: 12,
  },

  voltarTexto: {
    color: '#F5C542',
    fontSize: 16,
    fontWeight: 'bold',
  },

  jogoBox: {
    borderTopWidth: 1,
    borderTopColor: '#355C85',
    paddingTop: 12,
    marginTop: 12,
  },

  jogoTitulo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  placarText: {
    color: '#F5C542',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },

  placarDetalhe: {
    color: '#F5C542',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },

  infoText: {
    color: '#D6E4F0',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },

  detalheConfronto: {
    marginTop: 12,
    marginBottom: 12,
  },

  detalheTime: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  detalheVersus: {
    color: '#F5C542',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  detalheLabel: {
    color: '#F5C542',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2,
  },

  grupoBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#355C85',
  },

  grupoTitulo: {
    color: '#F5C542',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  grupoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  grupoSelecao: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  grupoCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  grupoCabecalhoTime: {
    color: '#D6E4F0',
    fontSize: 13,
    fontWeight: 'bold',
  },

  grupoCabecalhoNumero: {
    color: '#D6E4F0',
    fontSize: 13,
    fontWeight: 'bold',
    width: 32,
    textAlign: 'center',
  },

  grupoNumeros: {
    flexDirection: 'row',
  },

  grupoNumero: {
    color: '#FFFFFF',
    fontSize: 15,
    width: 32,
    textAlign: 'center',
  },

  adBox: {
    marginTop: 10,
    marginBottom: 30,
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