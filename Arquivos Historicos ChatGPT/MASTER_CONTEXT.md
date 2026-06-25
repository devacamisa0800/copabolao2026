# MASTER_CONTEXT.md

# CopaBolao 2026

## Visão Geral

Aplicativo mobile para criação, gerenciamento e participação em bolões da Copa do Mundo FIFA 2026.

O objetivo do produto é permitir que usuários criem bolões privados, convidem participantes por código, registrem palpites para partidas da Copa, acompanhem pontuação e ranking, e evoluam para funcionalidades sociais e monetização.

A prioridade atual é lançar rapidamente um MVP sólido, sem ficar preso a melhorias infinitas. Funcionalidades administrativas avançadas podem ficar para versões posteriores.

---

# Arquitetura Atual

## Frontend

- React Native
- Expo
- Expo Router
- TypeScript

A navegação é baseada em rotas de arquivo pelo Expo Router.

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security
- REST API automática do Supabase
- Funções SQL para pontuação e ranking

## Estratégia Arquitetural

- Backend único no Supabase.
- Supabase Auth como fonte de identidade.
- Tabela `usuarios` como perfil interno da aplicação.
- UUID como chave primária.
- Expo Router como padrão de navegação.
- Cada palpite pertence a um `participante`, não diretamente a um usuário.
- Lógica de negócio nova deve ser movida gradualmente para `lib/` ou para funções SQL quando for regra de banco.
- Telas devem priorizar interface e fluxo do usuário.
- Priorizar MVP lançável rápido.

---

# Tecnologias Utilizadas

## Frontend

- React Native
- Expo SDK
- Expo Router
- TypeScript

## Backend

- Supabase
- PostgreSQL
- Row Level Security
- Funções SQL/PostgreSQL

## Autenticação

- Google OAuth
- Supabase Auth
- Deep Link: `appcopa://auth`

## Ferramentas

- Visual Studio Code
- Git
- GitHub
- Node.js
- npm
- Expo Go

## Dependências Importantes

- `expo`
- `expo-router`
- `react`
- `react-native`
- `typescript`
- `@supabase/supabase-js`
- `expo-web-browser`
- `expo-clipboard`

---

# Repositório

```text
https://github.com/devacamisa0800/copabolao2026
```

Branch de trabalho recomendada daqui para frente:

```text
main
```

Fluxo Git recomendado:

```bash
git status
git add .
git commit -m "feat: descricao-da-funcionalidade"
git push origin main
```

---

# Estrutura Atual de Diretórios

```text
copabolao2026/
├── app/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── modal.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── copa.tsx
│   │   └── bolao.tsx
│   ├── bolao/
│   │   └── [id].tsx
│   ├── palpites/
│   │   └── [bolaoId].tsx
│   └── ranking/
│       └── [bolaoId].tsx
├── assets/
├── components/
├── constants/
│   ├── selecoes.ts
│   └── theme.ts
├── hooks/
├── lib/
│   ├── supabase.ts
│   └── palpites.ts
├── scripts/
├── package.json
├── tsconfig.json
└── app.json
```

---

# Navegação

## Rotas Públicas

```text
/login
```

## Rotas Protegidas

```text
/(tabs)
/(tabs)/index
/(tabs)/copa
/(tabs)/bolao
/bolao/[id]
/palpites/[bolaoId]
/ranking/[bolaoId]
```

## Controle de Sessão

O controle de sessão é realizado em `app/_layout.tsx`, usando:

- `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange()`

---

# Banco de Dados

## `usuarios`

Campos principais:

- `id`
- `auth_id`
- `email`
- `nome_completo`
- `apelido`
- `foto_url`
- `criado_em`

Função: perfil interno do usuário, vinculado ao Supabase Auth por `auth_id`.

## `boloes`

Campos principais:

- `id`
- `nome`
- `codigo`
- `criado_em`

Função: representa um bolão privado.

## `participantes`

Campos principais:

- `id`
- `usuario_id`
- `bolao_id`
- `criado_em`

Constraint:

```sql
unique(usuario_id, bolao_id)
```

Função: relaciona usuários a bolões.

## `jogos`

Campos principais:

- `id`
- `time_casa`
- `time_fora`
- `data_jogo`
- `fase`
- `grupo`
- `status`
- `placar_casa`
- `placar_fora`
- `api_id`
- `estadio`
- `cidade`

Função: armazena jogos da Copa 2026.

## `palpites`

Campos principais:

- `id`
- `participante_id`
- `jogo_id`
- `gols_casa`
- `gols_fora`
- `pontos`
- `criado_em`
- `atualizado_em`

Constraint importante:

```sql
unique(participante_id, jogo_id)
```

Função: garante somente um palpite por participante por jogo, permitindo atualização via upsert.

## RLS de `palpites`

Foram criadas policies para permitir que o usuário autenticado:

- visualize seus próprios palpites;
- crie seus próprios palpites;
- atualize seus próprios palpites.

A validação é feita via relação:

```text
auth.uid() -> usuarios.auth_id -> participantes.usuario_id -> palpites.participante_id
```

---

# Funções SQL Implementadas

## `calcular_pontos_palpite(...)`

Calcula os pontos de um palpite com base no resultado oficial.

Regra atual:

- Placar exato: 5 pontos.
- Acertou vencedor/empate e saldo: 3 pontos.
- Acertou vencedor/empate: 2 pontos.
- Errou: 0 pontos.

## `recalcular_pontos_jogo(jogo_uuid uuid)`

Recalcula todos os palpites de um jogo quando há resultado oficial.

## Trigger `trg_recalcular_pontos_jogo`

Executada após atualização de `placar_casa`, `placar_fora` ou `status` em `jogos`.

Função: manter `palpites.pontos` atualizado automaticamente.

## `ranking_bolao(bolao_uuid uuid)`

Retorna o ranking de participantes de um bolão com:

- `participante_id`
- `usuario_id`
- `nome`
- `foto_url`
- `total_pontos`
- `palpites_com_pontos`

Ordenação:

1. Maior pontuação.
2. Mais palpites pontuados.
3. Nome.

---

# Funcionalidades Concluídas

## Infraestrutura

- Projeto Expo configurado.
- TypeScript funcionando.
- Supabase configurado.
- GitHub integrado.
- Fluxo de commit/push validado na branch `main`.

## Autenticação

- Login Google validado.
- Deep Link `appcopa://auth` validado.
- Sessão Supabase persistente.
- Logout funcionando.
- Rotas protegidas funcionando.

## Usuários

- Criação automática de usuário na tabela `usuarios`.
- Associação correta entre `auth.users.id` e `usuarios.auth_id`.
- Nome, e-mail e foto vindos do Google.

## Bolões

- Tela definitiva de “Meus Bolões”.
- Listagem de bolões do usuário autenticado.
- Criação de bolões via modal.
- Entrada em bolão por código via modal.
- Geração automática de código de convite.
- Proteção contra participação duplicada.
- Bloqueio contra clique duplo durante criação/entrada.
- Cards com nome e código.
- Copiar código com `expo-clipboard`.
- Compartilhar convite com `Share` do React Native.
- Ocultação de bolões sem nome na listagem.

## Detalhe do Bolão

- Tela `app/bolao/[id].tsx` criada.
- Exibe nome do bolão.
- Exibe código de convite.
- Copiar código.
- Compartilhar convite.
- Lista participantes.
- Botão “⚽ Fazer Palpites”.
- Botão “🏆 Ver Ranking”.
- Ranking resumido integrado.
- Navegação para `/palpites/[bolaoId]`.
- Navegação para `/ranking/[bolaoId]`.

## Palpites

- Arquivo `lib/palpites.ts` criado como primeiro serviço de domínio.
- Tela `app/palpites/[bolaoId].tsx` criada.
- Carrega participante do usuário no bolão.
- Carrega jogos da Copa.
- Carrega palpites já existentes.
- Permite salvar palpite.
- Permite atualizar palpite.
- Bloqueia edição após início do jogo.
- Usa `upsert` com `onConflict: participante_id,jogo_id`.
- RLS validado para salvar palpites.
- Exibe status visual dos jogos.
- Exibe resultado oficial quando disponível.
- Jogos abertos aparecem antes dos encerrados.
- Jogos encerrados aparecem no final em formato reduzido.

## Pontuação

- Motor de pontuação implementado no Supabase.
- Função `calcular_pontos_palpite` validada.
- Trigger de recálculo criada na tabela `jogos`.
- Campo `palpites.pontos` passa a ser atualizado automaticamente quando há resultado oficial.

## Ranking

- Função SQL `ranking_bolao` implementada e validada.
- Ranking integrado na tela de detalhe do bolão.
- Tela dedicada `/ranking/[bolaoId]` criada.
- Ranking mostra participantes, pontos e palpites pontuados.

---

# Funcionalidades em Andamento

## Ranking dedicado

A tela dedicada de ranking foi criada, mas ainda precisa ser testada no Expo Go após a última alteração.

Pontos a validar:

- botão “🏆 Ver Ranking” aparece na tela do bolão;
- toque no botão abre `/ranking/[bolaoId]`;
- ranking exibe participante e pontos;
- pull-to-refresh recarrega ranking;
- volta pela navegação do Expo funciona.

---

# Funcionalidades Planejadas para MVP

## Entrada de participantes por código

Fluxo já existe parcialmente, mas deve ser validado e refinado:

- usuário digita código de convite;
- app localiza o bolão;
- app adiciona participante;
- participante aparece na lista;
- participante aparece no ranking;
- participante pode fazer palpites imediatamente.

## Dashboard do Bolão

- Resumo do bolão.
- Próximo jogo.
- Ranking resumido.
- Botões principais: palpites, ranking, participantes, compartilhar.

## Publicação

- Preparar build para Android.
- Publicação Google Play.
- iOS/App Store pode ficar para etapa posterior, se necessário.

---

# Funcionalidades para Pós-MVP

- Renomear bolão.
- Excluir bolão.
- Remover participante.
- Administrador/dono do bolão.
- Link universal/deep link direto para convite.
- Notificações.
- Perfil do usuário.
- Histórico avançado.
- Estatísticas.
- Monetização com anúncios.

---

# Decisões Arquiteturais Consolidadas

- Não reestruturar arquitetura sem necessidade.
- Manter Expo Router.
- Usar Supabase como backend único.
- Usar RLS para segurança no banco.
- Usar tabela `usuarios` como perfil interno.
- Usar `participantes` como entidade central para palpites e ranking.
- Cada palpite pertence a um `participante`, não diretamente a um usuário.
- Usar `upsert` para criar/atualizar palpites.
- Garantir um palpite por participante por jogo via constraint única.
- Cálculo de pontos deve ficar no Supabase, não no celular.
- Ranking deve consumir função SQL `ranking_bolao`.
- Evitar lógica de negócio excessiva dentro de telas novas.
- Criar serviços em `lib/` para regras e acesso ao Supabase quando fizer sentido.
- Priorizar MVP lançável rápido.
- Funcionalidades administrativas avançadas ficam para v1.1.
- Não mexer em tela grande/estável apenas por refatoração estética.

---

# Padrões de Desenvolvimento

- TypeScript obrigatório.
- Para arquivos novos ou grandes alterações, substituir o arquivo inteiro para reduzir erro manual.
- O usuário envia o conteúdo completo do arquivo atual; o assistente devolve o arquivo completo atualizado.
- Evitar alterações linha a linha quando houver risco de confusão.
- Manter componentes simples até a necessidade real de componentização.
- Usar `Alert.alert` para feedback imediato no MVP.
- Usar `try/finally` para liberar estados como `salvando`.
- Evitar `any` em novas funcionalidades sempre que possível.
- Logs temporários podem ser usados para diagnóstico, mas devem ser removidos antes da publicação.
- Após funcionalidade importante: testar, commitar, dar push e atualizar arquivos de continuidade.

---

# Estado Atual Consolidado

O projeto possui autenticação Google, usuários, bolões, participantes, convite, detalhes do bolão, palpites, motor de pontuação e ranking funcionando com Supabase e RLS.

O último checkpoint foi enviado ao GitHub na branch `main` com o commit:

```text
Implementa sistema de ranking e motor de pontuação
```

A próxima ação imediata é testar no Expo Go a nova tela dedicada de ranking criada em `app/ranking/[bolaoId].tsx`.
