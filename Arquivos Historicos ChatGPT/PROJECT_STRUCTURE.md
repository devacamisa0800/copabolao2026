# PROJECT_STRUCTURE.md

# Estrutura do Projeto CopaBolao 2026

```text
copabolao2026/
├── app/
├── assets/
├── components/
├── constants/
├── hooks/
├── lib/
├── scripts/
├── package.json
├── tsconfig.json
└── app.json
```

---

# `app/`

Pasta principal de rotas do Expo Router.

Cada arquivo representa uma rota ou parte da navegação.

---

## `app/_layout.tsx`

Responsável por:

- controle global de sessão;
- proteção de rotas;
- redirecionamento entre login e área autenticada;
- escuta de mudanças de autenticação com Supabase.

Não alterar sem necessidade.

---

## `app/login.tsx`

Tela pública de login.

Responsável por:

- iniciar Google OAuth;
- usar Supabase Auth;
- permitir entrada no app.

Não alterar sem necessidade.

---

## `app/modal.tsx`

Arquivo padrão do template Expo.

Sem papel central no MVP atual.

---

# `app/(tabs)/`

Grupo de abas principais do app autenticado.

## `app/(tabs)/_layout.tsx`

Define a navegação por abas.

Abas atuais:

- Início
- Copa
- Bolão

## `app/(tabs)/index.tsx`

Tela inicial do app autenticado.

Ainda pode evoluir para dashboard com resumo de palpites pendentes e ranking resumido.

## `app/(tabs)/copa.tsx`

Tela relacionada aos jogos da Copa.

Responsável por:

- listar jogos da Copa;
- exibir grupos;
- exibir estatísticas da Copa;
- exibir detalhes de jogos.

Estado atual: funcional e não deve ser refatorada sem necessidade.

## `app/(tabs)/bolao.tsx`

Tela “Meus Bolões”.

Responsável por:

- listar bolões do usuário;
- criar bolão via modal;
- entrar em bolão por código via modal;
- copiar código;
- compartilhar convite;
- navegar para detalhe do bolão.

Estado atual: funcional e aprovado visualmente.

---

# `app/bolao/`

Rotas relacionadas a um bolão específico.

## `app/bolao/[id].tsx`

Tela de detalhe/informações do bolão.

Responsável por:

- exibir nome do bolão;
- exibir código de convite;
- copiar código;
- compartilhar convite;
- listar participantes;
- exibir ranking resumido;
- navegar para a tela de palpites;
- navegar para a tela dedicada de ranking.

Estado atual: funcional com ranking resumido e botão “🏆 Ver Ranking”.

---

# `app/palpites/`

Rotas relacionadas aos palpites.

## `app/palpites/[bolaoId].tsx`

Tela principal de palpites de um bolão.

Responsável por:

- identificar o bolão pela rota;
- carregar o usuário autenticado;
- localizar o participante correspondente;
- carregar jogos;
- carregar palpites existentes;
- salvar novo palpite;
- atualizar palpite;
- bloquear edição após início do jogo;
- exibir status do palpite;
- exibir jogos abertos antes dos encerrados.

Estado atual: funcional e adequado ao MVP.

---

# `app/ranking/`

Rotas relacionadas ao ranking.

## `app/ranking/[bolaoId].tsx`

Tela dedicada de ranking de um bolão.

Responsável por:

- identificar o bolão pela rota;
- chamar a função SQL `ranking_bolao`;
- exibir participantes ordenados por pontos;
- exibir pontos totais;
- exibir quantidade de palpites pontuados;
- permitir pull-to-refresh.

Estado atual: criada, precisa ser validada no Expo Go.

---

# `lib/`

Pasta para serviços, regras de negócio e integrações.

## `lib/supabase.ts`

Cliente Supabase.

Responsável por:

- configurar URL e chave do Supabase;
- exportar o cliente usado pelo app.

Não alterar sem necessidade.

## `lib/palpites.ts`

Serviço de domínio dos palpites.

Responsável por:

- buscar participante do bolão;
- buscar jogos com palpites;
- salvar/atualizar palpites;
- verificar se o jogo já começou.

Esse arquivo é o modelo para futuros serviços como:

```text
lib/boloes.ts
lib/pontuacao.ts
lib/ranking.ts
```

---

# `constants/`

Pasta para constantes visuais e de configuração.

## `constants/selecoes.ts`

Mapa compartilhável de seleções.

Responsável por:

- mapear nomes vindos da API;
- exibir nome em português;
- exibir bandeira.

Estado atual: criado, mas `app/(tabs)/copa.tsx` foi mantido sem refatoração para reduzir risco.

## `constants/theme.ts`

Arquivo de tema/estilos base do projeto.

---

# `components/`

Pasta para componentes reutilizáveis.

Estado atual:

- contém componentes vindos do template/base do projeto;
- ainda não foi usada fortemente para o domínio do app.

Possíveis componentes futuros:

- `BolaoCard`
- `JogoPalpiteCard`
- `RankingItem`
- `ParticipanteItem`

---

# `hooks/`

Pasta para hooks reutilizáveis.

Atualmente contém hooks do template/base.

Possíveis hooks futuros:

- `useUsuarioAtual`
- `useBolaoAtual`
- `usePalpites`

---

# `assets/`

Pasta para imagens, ícones e recursos estáticos.

Possíveis usos futuros:

- logo do CopaBolão;
- ícone do app;
- splash screen;
- bandeiras customizadas se necessário.

---

# `scripts/`

Pasta para scripts auxiliares.

Possíveis usos:

- importação dos jogos da Copa;
- atualização de resultados;
- tarefas administrativas.

---

# Supabase / Banco

Funções SQL importantes:

```text
calcular_pontos_palpite
recalcular_pontos_jogo
trigger_recalcular_pontos_jogo
ranking_bolao
```

Trigger importante:

```text
trg_recalcular_pontos_jogo
```

Tabelas centrais:

```text
usuarios
boloes
participantes
jogos
palpites
grupos
```

---

# Convenção de Continuidade

Para novos chats, carregar sempre:

```text
MASTER_CONTEXT.md
AI_HANDOFF.md
NEXT_TASK.md
PROJECT_STRUCTURE.md
```

Para alterações de código, preferir o fluxo:

1. Usuário envia arquivo inteiro atual.
2. Assistente devolve arquivo inteiro atualizado.
3. Usuário substitui no VS Code.
4. Testa no Expo Go.
5. Se aprovado, commit e push para GitHub.
6. Atualizar arquivos de continuidade se a entrega for relevante.

Esse padrão reduz erros manuais e acelera o desenvolvimento.

---

# Fluxo Git Recomendado

Usar apenas a branch:

```text
main
```

Comandos padrão:

```bash
git status
git add .
git commit -m "feat: descricao-da-funcionalidade"
git push origin main
```

Evitar trabalhar em `develop` para reduzir complexidade, já que o projeto está sendo desenvolvido individualmente.
