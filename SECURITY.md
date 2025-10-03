# Guia de Segurança - Verus Científica

## 🔐 Configuração de Variáveis de Ambiente

### 1. Copie o arquivo de exemplo
```bash
cp env.example .env.local
```

### 2. Configure as variáveis necessárias

#### Firebase (Client-side)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave_firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://seu_projeto.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

#### Firebase Admin (Server-side)
```env
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_PRIVATE_KEY_ID=seu_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=seu_service_account@seu_projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu_client_id
```

#### Email
```env
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=sua_senha_de_app
GMAIL_TO=destinatario@exemplo.com
```

#### Google AI API
```env
NEXT_PUBLIC_GOOGLE_AI_API_KEY=sua_chave_google_ai
```

## 🛡️ Melhorias de Segurança Implementadas

### ✅ Correções Críticas
- [x] Chave API do Google movida para variável de ambiente
- [x] Sanitização de HTML implementada para prevenir XSS
- [x] Validação de URLs na API /api/html
- [x] Content Security Policy melhorada
- [x] Sistema de logging adequado implementado

### ✅ Melhorias de Performance
- [x] Debounce implementado na busca
- [x] Tratamento de erros melhorado
- [x] Logs sensíveis removidos

## 🚨 Ações Necessárias

### 1. Configurar Variáveis de Ambiente
- Copie `env.example` para `.env.local`
- Configure todas as variáveis com seus valores reais
- **NUNCA** commite o arquivo `.env.local`

### 2. Configurar Firebase Security Rules
As regras atuais estão em `database.rules.json`:
```json
{
  "rules": {
    "produtos": {
      ".read": true,
      ".write": "auth != null && auth.token.admin == true"
    }
  }
}
```

### 3. Configurar Domínios Permitidos
No arquivo `app/api/html/route.ts`, adicione domínios confiáveis:
```typescript
const ALLOWED_DOMAINS = [
  'loccus.com.br',
  'www.loccus.com.br',
  // Adicione outros domínios confiáveis
];
```

## 🔍 Monitoramento

### Logs de Segurança
- Erros são logados automaticamente
- Informações sensíveis são redactadas
- Em produção, considere integrar com Sentry ou similar

### Validações Implementadas
- URLs são validadas antes de fetch
- HTML é sanitizado antes de renderizar
- Timeout de 10 segundos em requests externos
- Limite de 1MB para HTML

## 📋 Checklist de Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Firebase Security Rules aplicadas
- [ ] Domínios permitidos configurados
- [ ] Testes de segurança realizados
- [ ] Monitoramento configurado
- [ ] Backup do banco de dados

## 🆘 Em Caso de Problemas

1. Verifique os logs no console
2. Confirme se as variáveis de ambiente estão corretas
3. Teste as APIs individualmente
4. Verifique as regras do Firebase

## 📞 Contato

Para questões de segurança, entre em contato com a equipe de desenvolvimento.
