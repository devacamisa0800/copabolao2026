import { parseWorldCupFootballTxt } from '../lib/worldCupSync';

const SOURCE_URL = 'https://raw.githubusercontent.com/openfootball/worldcup/master/2026--usa/cup.txt';

async function main() {
  const response = await fetch(SOURCE_URL);

  if (!response.ok) {
    throw new Error(`Falha ao baixar arquivo remoto: ${response.status}`);
  }

  const text = await response.text();
  const jogos = parseWorldCupFootballTxt(text);

  console.log(`Jogos encontrados: ${jogos.length}`);
  console.log('Primeiro jogo:');
  console.log(jogos[0]);
  console.log('Último jogo:');
  console.log(jogos[jogos.length - 1]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
