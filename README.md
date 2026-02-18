# Verus Científica – Website

Site da empresa (Next.js 15, Firebase). Catálogo de produtos, busca, orçamento e área administrativa.

---

## Estrutura do projeto

```
├── app/
│   ├── api/           # rotas de API (orçamento por email, fetch de HTML)
│   ├── components/     # componentes reutilizáveis (NavBar, ProductCard, busca, etc.)
│   ├── editor/        # área admin: listagem e criação/edição de produtos (TipTap)
│   ├── hooks/         # useAuth, useQuote (cotação no localStorage)
│   ├── produtos/      # páginas dinâmicas: categoria / subcategoria / produto
│   ├── search/        # página de busca
│   ├── orcamento/     # formulário de solicitação de orçamento
│   ├── layout.tsx, page.tsx, sitemap.ts, robots.ts
│   └── ...
├── lib/
│   ├── databaseFunctions.ts   # CRUD Firebase (produtos, categorias, tags, busca global)
│   ├── firebase.mjs          # config Firebase (Realtime DB, Storage, Auth)
│   ├── searchCache.ts        # cache da busca para reduzir chamadas ao Firebase
│   ├── canonicalUtils.ts     # URLs canônicas e metadados para SEO
│   ├── htmlSanitizer.ts      # sanitização de HTML (editor/descrições)
│   ├── adminConfig.ts        # lista de emails admin
│   ├── logger.ts             # logging (dev vs produção)
│   └── migrateProducts.ts, cleanDuplicates.ts, debugSubcategories.ts
├── middleware.ts     # redirecionamentos, canonical, cache
├── next.config.ts
└── public/
```

---

## Soluções e decisões

| Problema | Solução |
|----------|--------|
| **Hospedagem Firebase com domínio próprio** | No `middleware`, redirecionamento 301 do domínio Firebase (`*.web.app` / `firebaseapp.com`) para `www.veruscientifica.com.br`. |
| **SEO e URL canônica** | Header `Link: rel="canonical"` no middleware; `canonicalUtils` para gerar URLs; metadados dinâmicos em `produtos/[[...slug]]/layout.tsx`. |
| **Muitas chamadas ao Firebase na busca** | Cache em memória em `lib/searchCache.ts` (TTL, tamanho máximo, invalidação). Busca global em `databaseFunctions` usa esse cache. |
| **Produtos em várias categorias** | Estrutura com `paths[]` (categoria + subcategoria por path); compatibilidade com campos legados `category` / `subcategory`. |
| **HTML do editor (XSS)** | `lib/htmlSanitizer.ts`: whitelist de tags/atributos, remoção de `script`, `iframe`, `on*`, `javascript:`. |
| **Orçamento por email** | API `app/api/orcamento/route.ts` com Nodemailer; template HTML com dados do formulário e produtos. |
| **Busca de HTML externo (iframes/descrição)** | API `app/api/html/route.ts`: só URLs HTTPS e domínios permitidos (ex.: fornecedores), timeout e limite de tamanho. |
| **Rotas protegidas (admin)** | `useAuth`: hooks `useRequireAuth` e `useRequireAdmin`; lista de admins em `lib/adminConfig.ts`. |
| **Sitemap dinâmico** | `app/sitemap.ts`: páginas estáticas + categorias + subcategorias com produtos + URLs de produtos; fallback em caso de erro. |

---
