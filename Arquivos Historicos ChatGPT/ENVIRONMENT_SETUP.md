# ENVIRONMENT_SETUP.md

# Objetivo

Manual para recriar o ambiente de desenvolvimento do projeto CopaBolao 2026 em uma instalação limpa do Windows.

---

# Pré-requisitos

Instalar:

- Google Chrome
- Visual Studio Code
- Git
- Node.js LTS
- npm
- Expo Go no celular
- Conta GitHub
- Conta Supabase

---

# Pasta de Projetos

Pasta recomendada no Windows:

```text
C:\Projetos
```

---

# Clonar Repositório

```bash
cd C:\Projetos
git clone https://github.com/devacamisa0800/copabolao2026.git
cd copabolao2026
```

---

# Instalar Dependências

```bash
npm install
```

Se alguma dependência Expo estiver desalinhada:

```bash
npx expo install --fix
```

---

# Dependências Importantes

O projeto usa:

- Expo
- Expo Router
- React Native
- TypeScript
- Supabase JS
- Expo Web Browser
- Expo Clipboard

Dependência instalada durante o projeto:

```bash
npx expo install expo-clipboard
```

---

# Configuração Supabase

Arquivo principal:

```text
lib/supabase.ts
```

Esse arquivo contém a configuração do cliente Supabase.

Verificar:

- URL do projeto Supabase;
- anon key;
- persistência de sessão;
- configuração compatível com React Native/Expo.

---

# Google OAuth

O login usa Google OAuth via Supabase Auth.

Deep Link validado:

```text
appcopa://auth
```

Verificar no Supabase:

- provedor Google habilitado;
- client ID configurado;
- redirect URLs configuradas;
- deep link compatível com `app.json`.

---

# Rodar o Projeto

```bash
npx expo start
```

Se houver cache ou problemas estranhos:

```bash
npx expo start -c
```

Se o celular não conseguir conectar pelo QR Code na rede local:

```bash
npx expo start --tunnel -c
```

---

# Teste no Celular

1. Instalar Expo Go.
2. Garantir que celular e computador estejam na mesma rede Wi-Fi.
3. Rodar `npx expo start`.
4. Escanear QR Code com Expo Go.

Problema comum:

- Tela branca ou erro de conexão geralmente indica celular em outra rede ou bloqueio de firewall.

---

# Estrutura Supabase Necessária

Tabelas esperadas:

- `usuarios`
- `boloes`
- `participantes`
- `jogos`
- `palpites`

Constraints importantes:

```sql
unique(usuario_id, bolao_id)
```

```sql
unique(participante_id, jogo_id)
```

---

# RLS Importante

A tabela `palpites` deve ter Row Level Security habilitado e policies que permitam ao usuário autenticado:

- selecionar seus palpites;
- inserir seus palpites;
- atualizar seus palpites.

A validação deve passar por:

```text
usuarios.auth_id = auth.uid()
participantes.usuario_id = usuarios.id
palpites.participante_id = participantes.id
```

---

# Fluxo de Validação Pós-Instalação

## 1. Login

- Abrir app.
- Fazer login Google.
- Confirmar entrada na área autenticada.

## 2. Bolões

- Criar bolão.
- Confirmar que aparece na lista.
- Copiar código.
- Compartilhar convite.

## 3. Entrada por Código

- Entrar com código de convite.
- Confirmar associação em `participantes`.

## 4. Detalhes do Bolão

- Abrir bolão.
- Confirmar código.
- Confirmar participantes.
- Tocar em “⚽ Fazer Palpites”.

## 5. Palpites

- Abrir tela de palpites.
- Salvar palpite em jogo aberto.
- Recarregar e confirmar que permanece salvo.
- Atualizar palpite.

---

# Comandos Úteis

```bash
npm install
npx expo start
npx expo start -c
npx expo start --tunnel -c
git status
git add .
git commit -m "mensagem"
git push
```

---

# Observações

- Não alterar `app/_layout.tsx`, `app/login.tsx` ou `lib/supabase.ts` sem necessidade.
- Expo Router deve continuar sendo o padrão.
- Evitar introduzir React Navigation manual.
- Para continuidade em novo chat, sempre carregar `MASTER_CONTEXT.md`, `AI_HANDOFF.md` e `NEXT_TASK.md`.
