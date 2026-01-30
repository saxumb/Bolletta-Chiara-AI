# BollettaChiara AI - Setup con GitHub Secrets

## 🔒 Configurazione Sicura della Chiave API

La chiave API di Google Gemini **non viene mai** memorizzata nel codice, ma gestita tramite **GitHub Secrets**.

### 1️⃣ Aggiungi il Secret su GitHub

1. Vai su **GitHub → Settings → Secrets and variables → Actions**
2. Clicca **New repository secret**
3. Nome: `GOOGLE_GENAI_API_KEY`
4. Valore: Incolla la tua chiave Google GenAI

### 2️⃣ Avvia il Server Localmente (Sviluppo)

```bash
# Installa le dipendenze
npm install

# Crea un file .env.local
echo "GOOGLE_GENAI_API_KEY=la_tua_chiave_qui" > .env.local

# Avvia sia il backend che il frontend
npm run dev-full

# Oppure in due terminali diversi:
npm run server      # Terminale 1
npm run dev         # Terminale 2
```

Il backend sarà disponibile su `http://localhost:3001`

### 3️⃣ Deploy in Produzione

Il backend può essere deployato su:

#### **Opzione A: Vercel** (Consigliato)
```bash
npm i -g vercel
vercel --prod
```
Poi aggiungi il secret su Vercel dashboard.

#### **Opzione B: Render**
1. Connetti il repository GitHub
2. Crea un Web Service
3. Aggiungi la variabile d'ambiente `GOOGLE_GENAI_API_KEY`

#### **Opzione C: Heroku**
```bash
heroku create
heroku config:set GOOGLE_GENAI_API_KEY=la_tua_chiave
git push heroku main
```

### 4️⃣ Configura il Frontend

Nel file `.env.local` (sviluppo) o tramite variabili d'ambiente (produzione):

```
VITE_BACKEND_URL=https://tuo-backend.vercel.app
```

### 🔐 Come Funziona

```
[App Mobile] → [Backend con API Key nei Secret] → [Google Gemini API]
```

- ✅ La chiave API **rimane privata** sul server
- ✅ L'app mobile **non conosce** la chiave
- ✅ GitHub Secrets **protegge** la chiave durante il deploy
- ✅ Sicuro anche se qualcuno clona il repository

### 📋 Variabili d'Ambiente

| Variabile | Dove | Esempio |
|-----------|------|---------|
| `GOOGLE_GENAI_API_KEY` | GitHub Secrets + `.env.local` | `sk-...` |
| `VITE_BACKEND_URL` | `.env.local` (dev) o env vars (prod) | `http://localhost:3001` |
