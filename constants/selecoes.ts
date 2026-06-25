export type PaisInfo = {
  nome: string;
  bandeira: string;
};

export const paises: Record<string, PaisInfo> = {
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
  'Democratic Republic of the Congo': {
    nome: 'RD Congo',
    bandeira: '🇨🇩',
  },
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

export function traduzirPais(nome: string) {
  return paises[nome]?.nome || nome;
}

export function bandeiraPais(nome: string) {
  return paises[nome]?.bandeira || '🏳️';
}