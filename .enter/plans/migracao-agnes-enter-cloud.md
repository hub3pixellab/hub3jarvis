# Reorganização da landing — Terminal após o Hero, FAQ e novo menu

## Contexto

O usuário quer reordenar a landing do Mestre Agnes. Direção atual (mensagens mais recentes):

1. Trocar a seção "Sua análise em quatro passos" (`Analysis.tsx`) por uma seção **FAQ**.
2. Colocar o **terminal** em uma seção própria logo **depois da Hero** (hoje ele vive dentro da coluna direita da Hero).
3. **Menu** na ordem: Início, Terminal, Serviços, Planos, FAQ, Contato — e a página na mesma ordem.
4. **Remover** a seção "Sobre" (`About.tsx`, retrato do Mestre) — confirmado pelo usuário.

A ordem final da página: **Navbar → Hero → Terminal → Serviços → Planos → FAQ → Footer(Contato)**.

Não faz parte deste escopo (ficam para depois): a integração de IA do terminal, a "Minha Área" com horóscopo e o backend — o usuário redirecionou para a organização da landing.

## Estado atual (verificado)

- `src/pages/Index.tsx` monta: `Navbar, Hero, Services, About, Analysis, Pricing, Footer`.
- `Hero.tsx` tem grid de 2 colunas com `<Terminal />` na direita; CTAs apontam para `#analise` e `#sobre` (âncoras que deixarão de existir).
- `Terminal.tsx` é só o painel de vidro e já carrega `id="terminal"` no raiz.
- `Analysis.tsx` (`id="analise"`) tem os 4 passos + CTAs para `#pagamento` e `#terminal`.
- `Pricing.tsx` já é `id="pagamento"` (Planos).
- `Footer.tsx` tem `NAVIGATION` com links para `#analise`, `#terminal`, `#pagamento`, `/dashboard`, `#inicio`, `#contato`.
- `Navbar.tsx` (`NAV_ITEMS`): home, about, services, terminal, contact — precisa virar a ordem nova.
- i18n: não existem chaves `faq.*` nem `nav.plans`/`nav.faq`. Existem `nav.about`, `analysis.*`, `about.*` (ficam órfãs e serão removidas).
- Acordeão shadcn disponível em `src/components/ui/accordion.tsx` (Radix).

## Mudanças

### 1. `src/components/agnes/TerminalSection.tsx` (novo)
- Envolve o `<Terminal />` em uma `<section id="terminal">` com eyebrow e título (reutiliza a estética das outras seções: linha dourada, `font-cinzel`/`font-jost`, fundo navy).
- O `id="terminal"` sai do raiz de `Terminal.tsx` (evita âncora duplicada) — o painel passa a não ter `id` próprio.

### 2. `src/components/agnes/Faq.tsx` (novo)
- Substitui `Analysis.tsx`. `<section id="faq">` com eyebrow + título e um `Accordion` (shadcn) com 5–6 perguntas/respostas reais do negócio (como funciona a consulta, quais dados enviar, formas de pagamento, prazo de entrega, reembolso, como acessar a análise).
- Sem reusar a mascote/imagem de `Analysis.tsx`; visual consistente com as demais seções (starfield, blur de ambiência).

### 3. `src/components/agnes/Hero.tsx`
- Remove `<Terminal />` da coluna direita e a grade de 2 colunas → copy centralizada/à esquerda em tela cheia.
- CTAs atualizados: primário → `#terminal`, secundário → `#pagamento` (nada aponta mais para `#analise`/`#sobre`).

### 4. `src/components/agnes/Navbar.tsx`
- `NAV_ITEMS` vira: home(`#inicio`), terminal(`#terminal`), services(`#servicos`), plans(`#pagamento`), faq(`#faq`), contact(`#contato`).
- CTA do navbar (`nav.cta`) aponta para `#pagamento` (compra) — mantém visual atual.
- Mesmo ajuste no menu mobile.

### 5. `src/components/agnes/Footer.tsx`
- `NAVIGATION` reordenado/alinhado à nova estrutura (Início, Terminal, Serviços, Planos, FAQ, Minha Área, Contato); remove link para `#analise`.

### 6. `src/pages/Index.tsx`
- Nova ordem: `Hero, TerminalSection, Services, Pricing, Faq, Footer`. Remove `About` e `Analysis`.

### 7. Arquivos removidos
- `src/components/agnes/About.tsx` e `src/components/agnes/Analysis.tsx` (deletados).

### 8. i18n — nos 6 locales (`en`, `es`, `fr`, `it`, `pt`, `pt-BR`)
- Adicionar: `nav.plans`, `nav.faq`, e seção `faq.*` (eyebrow, título, 5–6 perguntas/respostas traduzidas).
- Remover: `nav.about`, `about.*`, `analysis.*` (órfãs após deletar os componentes).
- Verificar `reports/i18n/` não acusar `missing` novo.

## Implementation checklist

- [ ] `TerminalSection.tsx` criado com `id="terminal"`, eyebrow e título; `id` removido do raiz de `Terminal.tsx`
- [ ] `Faq.tsx` criado com `id="faq"` e `Accordion` do shadcn (5–6 perguntas)
- [ ] `Hero.tsx` sem terminal na coluna direita; CTAs → `#terminal` e `#pagamento`
- [ ] `Navbar.tsx` com ordem Início, Terminal, Serviços, Planos, FAQ, Contato (desktop e mobile); CTA → `#pagamento`
- [ ] `Footer.tsx` com navegação alinhada e sem `#analise`
- [ ] `Index.tsx` na ordem Hero, Terminal, Serviços, Planos, FAQ, Footer
- [ ] `About.tsx` e `Analysis.tsx` deletados
- [ ] Chaves `nav.plans`, `nav.faq`, `faq.*` adicionadas nos 6 locales; `nav.about`, `about.*`, `analysis.*` removidas
- [ ] Nenhuma referência restante a `#analise`, `#sobre`, `About`, `Analysis` no código

## Verification checklist

- [ ] `pnpm run build` e `pnpm run check` passam
- [ ] Âncoras do menu levam às seções na ordem correta (terminal logo após hero)
- [ ] Nenhum link aponta para âncora inexistente (`#analise`, `#sobre`)
- [ ] FAQ abre/fecha as perguntas no accordion e traduz nos 6 idiomas
- [ ] `grep -rn "#analise\|#sobre\|About" src/` não retorna referências quebradas
- [ ] Verificar visual em `mobile_390` e `desktop_1280` na rota `/`
