# NEXT TASK

## Objetivo

Validar no Expo Go a nova tela dedicada de ranking e, se necessário, corrigir problemas de navegação ou carregamento.

A tela de ranking já foi criada em:

```text
app/ranking/[bolaoId].tsx
```

A tela de detalhe do bolão já foi atualizada para exibir:

```text
🏆 Ver Ranking
```

A próxima entrega deve confirmar que o ranking funciona no aplicativo, não apenas no banco.

---

## Arquivos Envolvidos

Validar/testar:

```text
app/bolao/[id].tsx
app/ranking/[bolaoId].tsx
```

Consultar se necessário:

```text
lib/supabase.ts
```

Não alterar sem necessidade:

```text
app/(tabs)/bolao.tsx
app/palpites/[bolaoId].tsx
app/(tabs)/copa.tsx
app/_layout.tsx
app/login.tsx
```

---

## Dependências

Já disponíveis:

- Supabase Auth.
- Tabela `usuarios`.
- Tabela `boloes`.
- Tabela `participantes`.
- Tabela `palpites`.
- Campo `palpites.pontos`.
- Função SQL `ranking_bolao(bolao_uuid uuid)`.
- Tela `app/bolao/[id].tsx`.
- Tela `app/ranking/[bolaoId].tsx`.

Nenhuma alteração obrigatória no banco para esta etapa.

---

## Critérios de Sucesso

A tela de ranking deve:

1. Ser acessível pelo botão “🏆 Ver Ranking” na tela de detalhe do bolão.
2. Abrir a rota `/ranking/[bolaoId]` corretamente.
3. Chamar a função Supabase `ranking_bolao`.
4. Exibir os participantes do bolão.
5. Exibir pontos totais corretamente.
6. Exibir quantidade de palpites pontuados.
7. Permitir pull-to-refresh.
8. Não quebrar a tela de detalhe do bolão.
9. Não quebrar a navegação para palpites.
10. Não exigir nenhuma alteração adicional no banco.

---

## Como Validar

Validar no celular com Expo Go.

### Teste 1

Abrir um bolão pela aba “Meus Bolões”.

Resultado esperado:

- tela de detalhe abre normalmente;
- botão “⚽ Fazer Palpites” aparece;
- botão “🏆 Ver Ranking” aparece;
- ranking resumido aparece na tela.

### Teste 2

Tocar em “🏆 Ver Ranking”.

Resultado esperado:

- nova tela de ranking abre;
- título “🏆 Ranking” aparece;
- participante aparece com pontos.

### Teste 3

Puxar a tela para baixo para atualizar.

Resultado esperado:

- ranking recarrega sem erro;
- dados continuam aparecendo.

### Teste 4

Voltar para a tela anterior.

Resultado esperado:

- navegação volta para detalhe do bolão;
- app não trava.

### Teste 5

Tocar em “⚽ Fazer Palpites”.

Resultado esperado:

- tela de palpites continua funcionando normalmente.

---

## Cuidados

- Não mexer na função SQL `ranking_bolao` se a tela carregar corretamente.
- Não alterar motor de pontuação nesta tarefa.
- Não alterar RLS.
- Não alterar `app/(tabs)/copa.tsx`.
- Não criar novas funcionalidades antes de validar o ranking dedicado.
- Se houver erro, corrigir apenas o necessário para a tela abrir e carregar.

---

## Próxima Tarefa Após Conclusão

Validar e refinar o fluxo completo de entrada em bolão por código.

Objetivo da próxima entrega:

- garantir que o usuário entre em um bolão usando código;
- garantir que não exista duplicidade de participante;
- garantir que o novo participante apareça na lista de participantes;
- garantir que o novo participante apareça no ranking;
- garantir que o participante consiga fazer palpites imediatamente.
