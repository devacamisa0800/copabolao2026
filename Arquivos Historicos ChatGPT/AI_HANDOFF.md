# AI_HANDOFF.md

# Estado Atual

O projeto CopaBolao 2026 está com o núcleo funcional validado: autenticação, usuários, bolões, participantes, convites, palpites, motor de pontuação e ranking funcionando com Supabase.

O foco atual é concluir a validação visual da tela dedicada de ranking e, em seguida, validar/refinar o fluxo completo de entrada em bolão por código.

---

# Concluído Nesta Sessão

## Pontuação

- Criada função SQL `calcular_pontos_palpite`.
- Regra validada:
  - placar exato: 5 pontos;
  - acertou vencedor/empate e saldo: 3 pontos;
  - acertou vencedor/empate: 2 pontos;
  - erro: 0 pontos.
- Criada função SQL `recalcular_pontos_jogo(jogo_uuid uuid)`.
- Criada trigger `trg_recalcular_pontos_jogo` na tabela `jogos`.
- Pontuação passa a ser recalculada automaticamente quando resultado oficial é atualizado.

## Ranking

- Criada função SQL `ranking_bolao(bolao_uuid uuid)`.
- Função validada no Supabase SQL Editor.
- Retorna participante, usuário, nome, foto, total de pontos e quantidade de palpites pontuados.
- Ranking integrado à tela de detalhe do bolão.
- Tela dedicada `app/ranking/[bolaoId].tsx` criada.
- Botão “🏆 Ver Ranking” adicionado em `app/bolao/[id].tsx`.

## GitHub

- Commit realizado e enviado para a branch `main`.
- Último commit visível no GitHub:

```text
Implementa sistema de ranking e motor de pontuação
```

---

# O Que Está Funcionando

- Login Google.
- Persistência de sessão.
- Criação automática do usuário em `usuarios`.
- Listagem dos bolões do usuário.
- Criação de bolões.
- Entrada em bolão por código já existe e precisa de validação completa.
- Listagem de participantes.
- Copiar código de convite.
- Compartilhar convite.
- Navegação para detalhes do bolão.
- Navegação para tela de palpites.
- Listagem de jogos na tela de palpites.
- Salvar palpite.
- Atualizar palpite.
- Bloquear palpite após início do jogo.
- Pontuação calculada no Supabase.
- Ranking calculado via função SQL.
- Ranking exibido na tela de detalhe do bolão.

---

# O Que Foi Criado/Alterado Recentemente

## Supabase

Funções criadas:

```sql
calcular_pontos_palpite(...)
recalcular_pontos_jogo(jogo_uuid uuid)
trigger_recalcular_pontos_jogo()
ranking_bolao(bolao_uuid uuid)
```

Trigger criada:

```sql
trg_recalcular_pontos_jogo
```

## Arquivos alterados/criados

```text
app/bolao/[id].tsx
app/ranking/[bolaoId].tsx
constants/selecoes.ts
```

Observação: `constants/selecoes.ts` foi criado, mas a tela `app/(tabs)/copa.tsx` foi preservada sem refatoração para evitar risco em arquivo grande e já validado.

---

# Próxima Ação Imediata

Testar no Expo Go a tela dedicada de ranking.

## Passos

1. Abrir o app no Expo Go.
2. Ir para “Meus Bolões”.
3. Entrar em um bolão.
4. Confirmar que aparece o botão “🏆 Ver Ranking”.
5. Tocar em “🏆 Ver Ranking”.
6. Confirmar que abre a tela `/ranking/[bolaoId]`.
7. Confirmar que o ranking exibe o participante e os pontos.
8. Testar pull-to-refresh.
9. Voltar para a tela do bolão.

---

# Próxima Tarefa Recomendada Depois do Teste

Validar e refinar o fluxo completo de entrada em bolão por código.

Objetivo:

- usuário entra com código do convite;
- sistema localiza o bolão;
- cria participante se ainda não existir;
- impede duplicidade;
- participante aparece na lista de participantes;
- participante aparece no ranking;
- participante pode fazer palpites imediatamente.

---

# Arquivos a Analisar Primeiro na Próxima Tarefa

```text
app/(tabs)/bolao.tsx
app/bolao/[id].tsx
```

Possivelmente criar/refatorar:

```text
lib/boloes.ts
```

Não alterar sem necessidade:

```text
app/_layout.tsx
app/login.tsx
lib/supabase.ts
app/(tabs)/copa.tsx
```

---

# Pendências Conhecidas

## Ranking dedicado

- Criado, mas ainda precisa ser testado no celular.

## Entrada por código

- Fluxo existe parcialmente, mas ainda precisa validação completa ponta a ponta com outro usuário ou cenário de teste.

## Palpites

- Tela está funcional e visualmente aprovada para MVP.
- Jogos encerrados aparecem ao final em formato reduzido.
- Nomes e bandeiras usam mapeamento local.

---

# Riscos e Cuidados

- Não quebrar o salvamento de palpites, que já foi validado.
- Não alterar RLS de `palpites`, pois já está funcionando.
- Não alterar a constraint `unique(participante_id, jogo_id)`.
- Não mudar a regra de bloqueio após início do jogo.
- Não recalcular pontos no app; manter no Supabase.
- Não reestruturar rotas.
- Não alterar `app/(tabs)/copa.tsx` sem necessidade.
- Manter foco no MVP.
- Evitar novas refatorações que não entreguem valor visível.

---

# Ponto de Continuidade

O próximo chat deve começar testando a tela dedicada `app/ranking/[bolaoId].tsx`. Se estiver funcionando, seguir para validar/refinar o fluxo completo de entrada em bolão por código.
