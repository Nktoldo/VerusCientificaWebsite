# 🚨 CORREÇÃO URGENTE - Google Indexando Domínio Errado

## ❌ **PROBLEMA CRÍTICO:**

O Google está escolhendo o domínio do Firebase como canônico:
```
✅ URL canônico declarado por você: https://www.veruscientifica.com.br/
❌ URL canônico escolhido pelo Google: https://veruswebsitedh.web.app/
```

**Impacto:** 
- Seu domínio personalizado NÃO está sendo indexado
- Todo o SEO está indo para o domínio do Firebase
- Usuários não encontram seu site pelo domínio correto

## ✅ **SOLUÇÕES APLICADAS:**

### 1. **Firebase.json - Redirecionamento 301** ✅

**Arquivo:** `firebase.json`

```json
{
  "hosting": {
    "redirects": [
      {
        "source": "**",
        "destination": "https://www.veruscientifica.com.br/:splat",
        "type": 301
      }
    ]
  }
}
```

**O que faz:**
- Redireciona TODAS as requisições do Firebase para seu domínio
- Status 301 = Redirecionamento permanente
- Google entenderá que o domínio correto é o personalizado

### 2. **Middleware - Redirecionamento em Runtime** ✅

**Arquivo:** `middleware.ts`

```typescript
if (host.includes('veruswebsitedh.web.app') || host.includes('firebaseapp.com')) {
  const url = request.nextUrl.clone();
  url.host = 'www.veruscientifica.com.br';
  url.protocol = 'https';
  return NextResponse.redirect(url, 301);
}
```

**O que faz:**
- Redireciona requisições do Firebase para domínio personalizado
- Adiciona header `Link` com canonical em todas as páginas
- Funciona em tempo de execução

### 3. **Sitemap Corrigido** ✅

**Arquivo:** `app/sitemap.ts`

**Estrutura correta:**
- **Categorias:** Usa `c.id` (nome sem espaços via generateLinkID)
- **Subcategorias:** Usa `s.id` (Firebase push key)
- **Produtos:** Usa `p.id` (Firebase push key)
- **Filtro:** Só inclui subcategorias com produtos

### 4. **Páginas Vazias com Noindex** ✅

**Arquivo:** `app/products/[[...slug]]/page.tsx`

```tsx
{items.length === 0 && !loading && (
  <head>
    <meta name="robots" content="noindex, follow" />
  </head>
)}
```

## 🚀 **AÇÕES URGENTES:**

### **Passo 1: Deploy Imediato** ⚠️

```bash
# Build da aplicação
npm run build

# Deploy para Firebase
firebase deploy --only hosting

# Verificar se o redirecionamento funciona
curl -I https://veruswebsitedh.web.app/
# Deve retornar: Location: https://www.veruscientifica.com.br/
```

### **Passo 2: Verificar Configuração do Firebase Hosting**

No Firebase Console:
1. Ir em **Hosting**
2. Verificar se `www.veruscientifica.com.br` está configurado como domínio principal
3. Se não estiver, adicionar domínio personalizado
4. Verificar se SSL está ativo

### **Passo 3: Google Search Console** 

#### A. Verificar ambos os domínios:
1. Adicionar `veruswebsitedh.web.app` como propriedade (se ainda não adicionado)
2. Verificar se está recebendo tráfego
3. Configurar redirecionamento 301

#### B. Solicitar mudança de domínio:
1. Google Search Console > Configurações
2. Mudança de endereço
3. Informar que mudou de `veruswebsitedh.web.app` para `www.veruscientifica.com.br`

#### C. Reenviar sitemap:
1. Google Search Console > Sitemaps
2. Remover sitemap antigo (se houver)
3. Adicionar: `https://www.veruscientifica.com.br/sitemap.xml`
4. Aguardar processamento

### **Passo 4: Forçar Reindexação**

```bash
# Para cada URL importante, solicitar indexação manual
https://www.veruscientifica.com.br/
https://www.veruscientifica.com.br/products
https://www.veruscientifica.com.br/orcamento
```

No Google Search Console:
1. Inspeção de URL
2. Digitar a URL
3. Clicar em "Solicitar indexação"
4. Aguardar processamento (pode levar dias)

## 🔍 **Verificações Pós-Deploy:**

### **1. Testar Redirecionamento:**
```bash
# Deve redirecionar para www.veruscientifica.com.br
curl -I https://veruswebsitedh.web.app/

# Deve mostrar:
# HTTP/2 301
# Location: https://www.veruscientifica.com.br/
```

### **2. Verificar Canonical:**
```bash
# Verificar canonical na home
curl -s https://www.veruscientifica.com.br/ | grep -i canonical

# Deve mostrar:
# <link rel="canonical" href="https://www.veruscientifica.com.br/" />
```

### **3. Verificar Sitemap:**
```bash
# Acessar sitemap
curl https://www.veruscientifica.com.br/sitemap.xml

# Verificar se as URLs usam domínio correto
```

## ⏱️ **Timeline Esperado:**

- **Imediato:** Redirecionamento funciona após deploy
- **1-3 dias:** Google detecta redirecionamento
- **1-2 semanas:** Google começa a indexar domínio correto
- **2-4 semanas:** Migração completa de indexação
- **1-3 meses:** Ranking se estabiliza no novo domínio

## 🎯 **Checklist de Correção:**

- [x] Firebase.json com redirecionamento 301
- [x] Middleware com redirecionamento em runtime
- [x] Sitemap corrigido com estrutura correta
- [x] Páginas vazias com noindex
- [ ] **DEPLOY URGENTE** - Aplicar mudanças
- [ ] Verificar redirecionamento funciona
- [ ] Google Search Console - Mudança de domínio
- [ ] Solicitar reindexação manual
- [ ] Monitorar por 2-4 semanas

## ⚠️ **IMPORTANTE:**

**NÃO ESPERE!** Este é um problema crítico que afeta todo seu SEO. Quanto mais tempo o Google indexar o domínio errado, mais difícil será reverter.

**Ação Imediata Requerida:**
1. ✅ Deploy das mudanças
2. ✅ Verificar redirecionamento
3. ✅ Google Search Console - Mudança de domínio
4. ✅ Solicitar reindexação

## 📞 **Se Persistir:**

Se após o deploy o problema continuar:

1. **Verificar DNS:**
   - Confirmar que `www.veruscientifica.com.br` aponta para Firebase
   - Verificar registros A/CNAME

2. **Verificar Firebase Console:**
   - Domínio personalizado está ativo?
   - SSL está configurado?
   - Status do domínio está "Conectado"?

3. **Remover domínio Firebase do Google:**
   - Adicionar noindex no domínio Firebase
   - Bloquear crawling no robots.txt do Firebase

## 🆘 **Comandos de Emergência:**

```bash
# 1. Build e deploy imediato
npm run build && firebase deploy --only hosting

# 2. Verificar redirecionamento
curl -I https://veruswebsitedh.web.app/

# 3. Verificar canonical
curl -s https://www.veruscientifica.com.br/ | grep canonical

# 4. Ver logs do Firebase
firebase hosting:channel:list
```

---

**Data da Correção:** 02/10/2025  
**Prioridade:** 🔴 CRÍTICA  
**Status:** ⏳ Aguardando Deploy

