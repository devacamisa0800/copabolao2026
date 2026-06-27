# Sync World Cup - Arquivos da próxima tarefa

Arquivos criados:

- `supabase/functions/sync_world_cup/index.ts`
- `lib/worldCupSync.ts`
- `scripts/test-worldcup-parser.ts`

## Observação importante

A Edge Function usa `SUPABASE_SERVICE_ROLE_KEY`, portanto deve rodar apenas no ambiente seguro do Supabase, nunca no app mobile.

## Validação sugerida

1. Copiar os arquivos para o projeto.
2. Confirmar se a tabela `jogos` possui constraint única ou índice único em `api_id`.
3. Rodar o parser localmente, se o projeto permitir execução TS em scripts.
4. Publicar/testar a Edge Function no Supabase.

## Fonte de dados

https://raw.githubusercontent.com/openfootball/worldcup/master/2026--usa/cup.txt
