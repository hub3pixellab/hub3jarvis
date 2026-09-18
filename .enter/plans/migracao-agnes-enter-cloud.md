# Minha Área do Mestre Agnes — Horóscopo do dia + Terminal de análises

## Contexto

A direção original mudou. As pendências apontavam para um backend Python no Render que **não existe neste repositório**. Ao investigar, descobri que boa parte da infraestrutura **já foi construída aqui** — o plano anterior partiu de uma premissa errada. Estado real:

- **Auth** já existe: e-mail/senha (login + cadastro) em `src/pages/AuthPage.tsx`, com `useAuth.tsx` seguindo as convenções (listener antes do `getSession`, callback não-async, sessão guardada).
- **Dashboard "Minha Área"** já existe em `/dashboard`: Visão Geral (`DashboardPage.tsx`), Perfil (`/dashboard/perfil`, com `ProfileForm` incluindo **`birth_date`** e signo derivado via `lib/zodiac.ts`), Compras (`PurchasesCard`) e Assinatura (`SubscriptionCard`).
- **Pagamentos** já conectados: `create-checkout-session` + `stripe-webhook` publicados. O webhook já valida assinatura com **`constructEventAsync` + `STRIPE_WEBHOOK_SECRET`**, rejeita corpo inválido com 400 e grava a compra via RPC `record_checkout_completion`. `config.toml` já tem `verify_jwt = false` no webhook.
- **Banco**: tabelas `profiles`, `purchased_analyses`, `subscriptions`, `global_stats` já existem com RLS.
- Tabelas de aplicação **não existem mais** para criar? Não — falta apenas `horoscopes`.

**A tarefa agora (mensagem mais recente):** na Visão Geral, dentro da identidade, mostrar o **horóscopo do dia** calculado pela data de aniversário do perfil, e inserir um **terminal** nessa parte com um campo para cada análise: **mapa natal, numerologia, eneagrama, compatibilidade e conselhos do mestre**. Decisões do usuário: horóscopo **livre**; análises **gated por pagamento**; terminal com **uma aba por tipo de análise**; usar **IA real** (ativar geração de texto).

Itens antigos resolvidos/irrelevantes (registro para não voltarem):
- `STORAGE_DADOS`/`agnesApi.ts`/`pagar()` não existem e não farão sentido: os dados agora ficam no banco via Enter Cloud, não em `localStorage`. Não criar.
- Item 2b (onrender no bundle) é inverso: nada referencia `onrender.com` e nada deve passar a referenciar. A verificação final é que o bundle não contenha `onrender` nem segredo.
- Item 3a: o webhook já retorna erro claro `"STRIPE_WEBHOOK_SECRET nao configurada"`. Falta erro claro para `STRIPE_SECRET_KEY` no checkout.
- Item 3b (commit/push): a plataforma commita automaticamente; não executo `git commit/push`.

## Correções de bug já identificadas

- **`create-checkout-session` tem `mode: 'payment'` fixo**, mas o Guia Mensal é preço recorrente → o Stripe rejeita (botão quebrado). Corrigir derivando `mode` de `price.recurring`.
- Falta erro claro quando `STRIPE_SECRET_KEY` não está configurada no checkout (retorna genérico `error.message`).

## Fase 1 — Banco (migração única)

`supabase_migration` criando **`horoscopes`** com RLS na mesma migração:
- `id`, `user_id` (not null, FK), `data` (date), `texto` (text), `created_at`.
- Política: `select` só das próprias linhas. **Nenhuma policy de insert/update para o cliente** — só a função de backend grava (isso mantém o gate de pagamento e o cache diário sob controle do servidor).
- Confirmar com `supabase_get_table_schema` que a RLS está ativa e as policies listadas.

## Fase 2 — Função de backend `agnes-conversar` (nova)

Uma função, vários tipos — o terminal e o horóscopo passam por ela:
- Requer JWT. Sem erro claro para envs ausentes.
- Corpo: `{ tipo, mensagem?, dadosNascimento?, parceiroNascimento? }` com `tipo` ∈ `horoscopo | mapa_natal | numerologia | eneagrama | compatibilidade | conselhos`.
- **Gate (só no servidor, nunca no cliente):** para tipos ≠ `horoscopo`, consultar `purchased_analyses` (status `pago`) **ou** `subscriptions` (`active`/`trialing`) do `user_id`; se não houver, retornar 402 `{ error: "compra_necessaria" }`.
- **Horóscopo livre:** aceita para qualquer usuário logado. Usa `profiles.birth_date` para derivar o signo (mesma lógica de `lib/zodiac.ts`) e o **cache diário** em `horoscopes` (uma chamada de IA por usuário/dia; leituras seguintes vêm do banco). Fazer upsert via client do service role.
- Chama o LLM com system prompt do Mestre Agnes (persona), no idioma do usuário (`Accept-Language`), com o prompt específico por tipo. Seguir o fluxo de seleção de modelo da skill `enter_llm_integration`.
- CORS conforme `references/edge-functions.md`; `Deno.serve`; import via esm.sh; sem SQL cru.

Requer **`enable_ai_capability`** antes (chamado no início da implementação) e carregar a skill `enter_llm_integration`.

## Fase 3 — Frontend

- **`src/lib/agnes.ts`** (novo, pequeno): `invocarAnalise(tipo, inputs)` → `supabase.functions.invoke('agnes-conversar')`, tipa retorno/erros (incl. 402).
- **`src/lib/horoscopo.ts`** (novo): derivar signo de `birth_date` (reusa `getZodiacSign` de `lib/zodiac.ts`), definir o tipo de data de hoje e mapear o resultado para exibição. Sem chaves de storage.
- **`src/components/dashboard/HoroscopeCard.tsx`** (novo): na Visão Geral, logo após o `IdentityCard`; carrega o horóscopo do dia (gratuito) usando `useProfile` + `lib/agnes.ts`; estados carregando/erro; visual consistente com o tema (cartão dourado/navy).
- **`src/components/dashboard/AnalysisTerminal.tsx`** (novo): terminal estilo vidro (reusa estética de `Terminal.tsx`, com `Tabs` do shadcn) com 5 abas — mapa natal, numerologia, eneagrama, compatibilidade, conselhos. Cada aba tem campo(s) específico(s) (compatibilidade pede a data do parceiro) e botão "Consultar o Mestre". Bloqueado com aviso + link para `/` quando não há compra paga (o gate real é no servidor; o bloqueio é só UX). Respostas renderizadas como mensagens do Mestre. Abas desabilitadas durante carregamento.
- **`src/pages/DashboardPage.tsx`**: adicionar `<HoroscopeCard />` e `<AnalysisTerminal />` abaixo do `IdentityCard`, mantendo Compras/Assinatura. A Visão Geral já é a "Minha Área" — o terminal fica dentro dela, como pedido.
- **i18n** — chaves novas nos 6 locales: seção `horoscopo.*` e `terminal.*` (títulos das 5 abas, placeholders, 402, loading, erros). Seguir o padrão de chaves achatadas de `src/i18n/config.ts`.
- **`supabase/functions/create-checkout-session/index.ts`**: derivar `mode` de `price.recurring`; validar `STRIPE_SECRET_KEY` com erro claro. Redeploy.

Sem novas rotas: a Visão Geral já vive em `/dashboard`. O `?pago=1` não existe e não será criado.

## Implementation checklist

- [ ] Migração cria `horoscopes` com RLS habilitada na mesma migração, sem policy de insert/update para o cliente
- [ ] `supabase_get_table_schema("horoscopes")` confirma RLS ativa e policies listadas
- [ ] `enable_ai_capability` aprovado e skill `enter_llm_integration` carregada
- [ ] `agnes-conversar` exige JWT e deriva `user_id` do token
- [ ] `agnes-conversar` retorna 402 `compra_necessaria` para tipos ≠ `horoscopo` sem compra paga/subscription ativa (checagem no servidor)
- [ ] `agnes-conversar` usa cache diário em `horoscopes` (upsert service role; 1 chamada IA/dia/usuário)
- [ ] `agnes-conversar` tem CORS completo e `Deno.serve`
- [ ] `agnes-conversar` publicada com `supabase_deploy_edge_function`
- [ ] `lib/agnes.ts` tipa retorno e erros (incl. 402)
- [ ] `HoroscopeCard` na Visão Geral, estados de loading/erro/sem-aniversário
- [ ] `AnalysisTerminal` com 5 abas, gate visual (link para pagamento) e estados de loading
- [ ] Chaves i18n nos 6 locales (horoscopo + 5 análises + erros)
- [ ] `create-checkout-session`: `mode` derivado de `price.recurring` + erro claro de `STRIPE_SECRET_KEY`, redeployed
- [ ] `pnpm run build` e `pnpm run check` sem erros

## Verification checklist

- [ ] `pnpm run build` e `pnpm run check` passam
- [ ] **Positivo:** usuário com `birth_date` no perfil vê o horóscopo do dia na Visão Geral sem pagar
- [ ] **Fronteira:** usuário sem `birth_date` vê estado "adicione seu aniversário" com link para o perfil, sem crash
- [ ] **Negativo:** usuário logado sem compra paga recebe 402 ao tentar análise e vê o bloqueio com link de compra
- [ ] **Positivo:** após compra paga (status `pago`), as 5 abas consultam o Mestre e renderizam resposta
- [ ] **Cache:** segunda visita no mesmo dia ao horóscopo não gera nova chamada de IA (registro lido do banco)
- [ ] **Negativo:** chamar `agnes-conversar` sem JWT → 401/403, sem resposta
- [ ] **Auth:** perfil (com aniversário) salva e reaparece após refresh
- [ ] **Bug corrigido:** compra do Guia Mensal abre checkout em modo assinatura (sem erro de `mode`)
- [ ] **Bundle (item 2b):** `grep -r "onrender\|agnes-secreta" dist/` não retorna nada
- [ ] Verificar `/dashboard` em `mobile_390` e `desktop_1280`
