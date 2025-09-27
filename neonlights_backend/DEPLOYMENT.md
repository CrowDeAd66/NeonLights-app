# NeonLights Backend - Guia de Deploy

## 🚖� RESUMO DOS AJUSTES

- ✅ Supabase configurado corretamente
- ✅ Arquivo main.py consolidado
- ✅ .env.example criado
- ✅ Firebase config corrigido

## 🚀Deploy Rápido

### 1. Deploy em Railway
```bash
npx railway login
npx railway new
npx railway add
npx railway deploy
```

### 2. Deploy em Render
```bash
# Conecte seu GitHub e deploye automaticamente
```

### 3. Configurar Variáveis
```
export SUPABASE_URL=https://euioogrfhrpdrghjvlbg.supabase.co
export SUPABASE_KEY=sua_chave_anon
export SUPABASE_SERVICE_KEY=sua_chave_service_role
```

### 4. Tester API
```bash
curl https://neonlights-backend.railway.app/health
# Deve retornar: {"status":"healthy",...}
```

## 🔮 URLS de Teste

- Health Check: `/health`
- Autenticação: `/api/auth/login`
- Eventos: `/api/events`
- Download: `/api/download/neonlights.apk`

## 🙌 Automático 
O repositório está pronto para deploy automático em:
- Railway: Conecte GitHub
- Render: Conecte GitHub
- Vercel: Conecte GitHub
- Heroku: `git push heroku main`