# Migração do backend Agnes para o Enter Cloud

## Contexto

As pendências originais apontavam para um backend Python hospedado no Render, que **não existe neste repositório** (nenhum `.py`, nenhum `agnesApi.ts`, nenhuma rota `/sucesso`, zero chamadas HTTP em `src/` — verificado inclusive em todo o histórico do git). A decisão foi migrar esse backend para o Enter Cloud e abandonar o Render.

Isso resolve a causa raiz do item 1a. O desenho antigo tinha um segredo compartilhado (`VITE_API_KEY=agnes-secreta-2026`, hoje commitado em texto puro no `.env.example`) que o navegador precisava apresentar. Trocar por "token de sessão curta" não resolveria: o cliente continuaria precisando da chave para pedir o token. Com login real, quem autentica é o usuário, e o servidor valida esse login — **não existe mais segredo compartilhado no bundle**.

Três pontos do pedido original mudam de forma, e vale registrar:

- **`STRIPE_PRICE_ID` não será usado.** O preço é derivado do produto no Stripe, então o ID fica num lugar só (o painel do Stripe). Validar uma variável que o código não lê seria teatro. Valido as duas que o código realmente usa.
- **O item 2b se inverte.** Não há mais `onrender.com` para confirmar no bundle — a verificação passa a ser o oposto: garantir que **nem** `onrender.com` **nem** qualquer chave apareçam no build.
- **O item 3b eu não executo.** `git commit`/`push` são bloqueados para mim; a plataforma commita automaticamente ao fim do turno.

**Ação fora do código, sua:** a `agnes-secreta-2026` está no histórico do git. Mesmo desligando o Render, revogue-a — histórico não se apaga.

## Fase 1 — Banco de dados

Migração única (`supabase_migration`), com RLS habilitada na mesma migração:

- **`profiles`** — `id` (PK → `auth.users`), `email`, `nome`, `created_at`. Trigger `on_auth_user_created` popula no signup. RLS: cada um lê/edita só a própria linha.
- **`pedidos`** — `id`, `user_id` (not null), `produto_id`, `plano_nome`, `stripe_session_id` (unique), `status` (`pendente`/`pago`/`cancelado`), `valor_centavos`, `moeda`, `metadados` (jsonb), `created_at`, `pago_em`.
  RLS: `select` **apenas das próprias linhas**; **nenhuma policy de insert/update para o cliente**. Só as funções de backend escrevem. É isso que impede alguém de marcar o próprio pedido como pago pelo navegador — o gate do item 1c não teria valor se o status fosse gravável do cliente.

Depois da migração, confirmar com `supabase_get_table_schema` que a RLS está de fato ativa nas duas tabelas.

## Fase 2 — Funções de backend

A função `create-checkout-session` que veio com a Stripe fica **intocada e sem uso** — ela é genérica, não autentica ninguém, não registra pedido e tem `mode: 'payment'` fixo.

**Esse `mode` fixo é um bug meu do turno anterior: criei o Guia Mensal como preço recorrente, e o Stripe rejeita recorrente em `mode: 'payment'`. O botão do Guia Mensal está quebrado em produção agora.** A função nova corrige.

### `supabase/functions/agnes-checkout/index.ts` (nova)
- Exige JWT; o `user_id` vem **do token**, nunca do corpo da requisição.
- Valida `STRIPE_SECRET_KEY`; se faltar, 500 com `"STRIPE_SECRET_KEY nao configurada"` (item 3a).
- Busca produto + preço ativo e **detecta `price.recurring`** → `mode: 'subscription'`, senão `'payment'`. Corrige o Guia Mensal.
- Insere `pedidos` com `status: 'pendente'` (service role, métodos do client — sem SQL cru).
- Manda `client_reference_id` + `metadata { pedido_id, user_id }` e usa chave de idempotência.
- Retorna `{ url }`.

### `supabase/functions/agnes-checkout-status/index.ts` (nova — item 1b)
- Exige JWT. Faz `stripe.checkout.sessions.retrieve(session_id)`.
- **Confere que a sessão pertence a quem está chamando** (via `metadata.user_id`); senão 403. Sem isso, qualquer um poderia sondar `session_id` alheio e destravar o download.
- Reconcilia `pedidos` para `pago` quando confirmado.
- Retorna `{ pago: boolean, metadados }`.

### `supabase/functions/stripe-webhook/index.ts` (nova — item 1d)
- `verify_jwt = false` em `supabase/config.toml` (o Stripe não envia JWT).
- Valida assinatura com **`constructEventAsync`** e `STRIPE_WEBHOOK_SECRET`. No Deno a variante síncrona falha — detalhe que quebra silenciosamente.
- Segredo ausente → 500 claro; assinatura inválida → 400 **antes de ler o corpo**. Corpo sem assinatura válida nunca é processado.
- Trata `checkout.session.completed` → marca o pedido como pago.

Publicar as três com `supabase_deploy_edge_function`. Depois do deploy do webhook, peço a URL no painel do Stripe e coleto o `STRIPE_WEBHOOK_SECRET` via `supabase_add_secret`.

## Fase 3 — Frontend: auth, storage e gate

- **`src/lib/agnesApi.ts`** (novo) — `export const STORAGE_DADOS = "agnes:dados"` (item 2a), os wrappers `criarCheckout()` / `consultarCheckout()` e os helpers `salvarDados`/`lerDados`/`limparDados`. **Única fonte da chave**, consumida por `Pricing.tsx` e `Sucesso.tsx` — fim das chaves divergentes.
- **`src/hooks/useAuth.tsx`** (novo) — listener `onAuthStateChange` registrado **antes** do `getSession`, guardando `user` **e** `session`, callback não-async, chamadas ao client dentro de `setTimeout(...,0)`.
- **`src/pages/Auth.tsx`** (novo) — e-mail/senha com **login e cadastro** + botão Google. `emailRedirectTo: origin + "/"`. Antes disso, `supabase_configure_auth` (auto-confirm de e-mail) e `supabase_configure_auth_provider("google")`.
- **`src/pages/Sucesso.tsx`** (novo) — lê `session_id` da URL e chama `consultarCheckout`. "Baixar relatório" fica **desabilitado até `pago === true`** (item 1c). **`?pago=1` é ignorado por completo** — não é lido em lugar nenhum, em nenhum ambiente.
- **`src/pages/Cancelado.tsx`** (novo).
- **`src/components/agnes/Pricing.tsx`** — exige login antes do checkout (senão manda pra `/auth`), chama `criarCheckout` e abre com **`window.open(data.url)`**, não `window.location.href` (outro acerto do meu turno anterior: navegar para fora mata o app).
- **`src/components/agnes/Navbar.tsx`** — entrada de login / sair.
- **`src/router.tsx`** — rotas `/auth`, `/sucesso`, `/cancelado`; `AuthProvider` em `src/App.tsx`.
- **i18n** — chaves novas nos 6 locales (`en`, `es`, `fr`, `it`, `pt`, `pt-BR`).
- **`.env.example`** — remover `VITE_API_KEY` e `VITE_API_BASE`. Deixar de fora, e não substituir: variáveis `VITE_*` não são suportadas nesta plataforma e são embutidas no bundle por natureza.

## Fase 4 — Terminal com IA real

Depende de `enable_ai_capability` e da skill `enter_llm_integration` (a escolha do modelo segue o fluxo dela).

- **`supabase/functions/agnes-conversar/index.ts`** (nova) — exige JWT, system prompt no papel do Mestre, chave do provedor só no servidor.
- **`src/components/agnes/Terminal.tsx`** — troca as respostas fixas pela função, com estados de carregando/erro.

## Implementation checklist

- [ ] Migração cria `profiles` e `pedidos` com RLS habilitada na mesma migração
- [ ] `pedidos` sem policy de insert/update para o cliente (status só muda no servidor)
- [ ] `supabase_get_table_schema` confirma RLS ativa nas duas tabelas
- [ ] Trigger de signup popula `profiles`
- [ ] `agnes-checkout` deriva `mode` de `price.recurring` (Guia Mensal volta a funcionar)
- [ ] `agnes-checkout` retorna 500 `"STRIPE_SECRET_KEY nao configurada"` quando a env falta
- [ ] `agnes-checkout` tira o `user_id` do JWT, não do corpo
- [ ] `agnes-checkout-status` retorna `{ pago, metadados }` e nega sessão de outro usuário com 403
- [ ] `stripe-webhook` usa `constructEventAsync` + `STRIPE_WEBHOOK_SECRET` e rejeita assinatura inválida com 400 antes de processar
- [ ] `verify_jwt = false` só para `stripe-webhook` no `config.toml`
- [ ] Três funções publicadas com `supabase_deploy_edge_function`
- [ ] `STRIPE_WEBHOOK_SECRET` coletado via `supabase_add_secret` após criar o endpoint no Stripe
- [ ] `STORAGE_DADOS` exportado em `agnesApi.ts` e usado em `Pricing.tsx` e `Sucesso.tsx` (nenhuma string literal solta)
- [ ] `useAuth` registra listener antes do `getSession` e guarda user + session
- [ ] `Auth.tsx` com login, cadastro e Google
- [ ] `Sucesso.tsx` só habilita download com `pago === true`; `?pago=1` não é lido
- [ ] `Pricing.tsx` usa `window.open` e exige login
- [ ] Rotas `/auth`, `/sucesso`, `/cancelado` + `AuthProvider` no `App.tsx`
- [ ] Chaves i18n nos 6 locales
- [ ] `VITE_API_KEY` e `VITE_API_BASE` removidos do `.env.example`
- [ ] `agnes-conversar` publicada e `Terminal.tsx` ligado nela

## Verification checklist

- [ ] `pnpm run build` e `pnpm run check` passam
- [ ] Os 3 `prod_` em `Pricing.tsx` resolvem no Stripe (se algum ID estiver errado, o checkout falha — conferir nos logs da função)
- [ ] **Positivo:** compra do Mapa Natal (avulso) → checkout abre → `/sucesso` libera o download
- [ ] **Positivo (o bug):** Guia Mensal abre checkout em modo assinatura, sem erro de `mode`
- [ ] **Negativo:** `/sucesso?pago=1` sem `session_id` → download **bloqueado**
- [ ] **Negativo:** `session_id` de outro usuário → 403, download bloqueado
- [ ] **Negativo:** checkout deslogado → redireciona para `/auth`, não chama a função
- [ ] **Negativo:** POST no webhook com assinatura inválida → 400 e nada gravado (conferir em `supabase_search_edge_function_logs`)
- [ ] **Fronteira:** tentar `update` em `pedidos` pelo client logado → negado pela RLS
- [ ] **Bundle (item 2b invertido):** `grep -r "onrender\|agnes-secreta" dist/` não retorna nada
- [ ] Login por e-mail e por Google entram e persistem após refresh
- [ ] `/` e `/sucesso` verificados em `mobile_390` e `desktop_1280`
