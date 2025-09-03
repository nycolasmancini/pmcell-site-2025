# 🚀 Configurações Obrigatórias do Vercel

## ⚠️ AÇÃO OBRIGATÓRIA: REMOVER NEXTAUTH_URL

### 1. NextAuth Configuration
```
# ❌ NÃO DEFINIR - Vercel define automaticamente
# NEXTAUTH_URL=https://pmcellvendas.vercel.app

# ✅ MANTER APENAS ESTA
NEXTAUTH_SECRET=<seu-secret-seguro-aqui>
```

### 2. Database Configuration
```
DATABASE_URL=<postgresql-connection-string>
DIRECT_URL=<postgresql-connection-string>
```

### 3. Other Environment Variables
```
NODE_ENV=production
```

## 📝 Como Configurar no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto: `pmcellvendas`
3. Vá em `Settings` > `Environment Variables`
4. **REMOVER** `NEXTAUTH_URL` se existir (causa conflitos)
5. **MANTER** apenas `NEXTAUTH_SECRET` e variáveis do banco
6. Ativar "Automatically expose System Environment Variables"

## ⚠️ CRÍTICO - PASSOS OBRIGATÓRIOS

1. **DELETAR** `NEXTAUTH_URL` das variáveis do Vercel
2. **MANTER** apenas `NEXTAUTH_SECRET` (sem caractere `$`)
3. Verificar que está marcado: ✅ "Automatically expose System Environment Variables"
4. Fazer novo deploy após alterações

## 🔍 Como Verificar se Funcionou

1. Faça login em: https://pmcellvendas.vercel.app/admin/login
2. Se funcionar, você será redirecionado para: `/admin/dashboard`
3. Verifique os logs no Vercel para confirmar que não há erros de token

---

**Nota**: Este arquivo foi criado automaticamente para ajudar na configuração do ambiente de produção.