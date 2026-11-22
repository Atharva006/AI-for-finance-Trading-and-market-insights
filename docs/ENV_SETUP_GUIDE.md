# 🔑 Environment Variables Setup Guide

This guide provides step-by-step instructions for obtaining all the API keys and environment variables used across the **ALLTRA** platform.

---

## 📋 Overview of Environment Variables

| Variable Name | Source Platform | Required | Purpose |
| :--- | :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | Supabase Cloud | **Yes** | Connects to your PostgreSQL database and auth engine |
| `VITE_SUPABASE_ANON_KEY` | Supabase Cloud | **Yes** | Client-side publishable key for telemetry, auth, and data sync |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase Cloud | Optional | Admin key for backend migrations and service scripts |
| `VITE_GROQ_API_KEY` | Groq Cloud | Optional | High-speed LLM inference for Market Pulse & Con Call summaries |
| `VITE_GROQ_MODEL` | Groq Cloud | Optional | Specific model identifier (e.g. `meta-llama/llama-prompt-guard-2-86m` or `llama-3.3-70b-versatile`) |
| `VITE_UPSTOX_ACCESS_TOKEN` | Upstox Developer Portal | Optional | Live real-time market data feed from Indian broker Upstox |
| `VITE_UPSTOX_API_KEY` | Upstox Developer Portal | Optional | App API key for Upstox OAuth login |
| `VITE_UPSTOX_API_SECRET` | Upstox Developer Portal | Optional | App Secret for token generation |
| `VITE_UPSTOX_REDIRECT_URI` | Your App URL | Optional | Callback URL registered in Upstox Developer Portal |
| `VITE_ALPHA_VANTAGE_API_KEY` | Alpha Vantage | Optional | Historical forex, crypto, and stock data feeds |
| `VITE_FINNHUB_API_KEY` | Finnhub.io | Optional | Real-time global market news and sentiment |
| `VITE_GATEWAY_SECURITY_PIN` | User-defined | Optional | Custom PIN to protect paper execution desks |

---

## 1. 🗄️ Supabase Cloud (Database & Authentication)

Supabase powers user authentication, live telemetry tracking (`user_sessions`), virtual trade journals (`user_orders`), and strategy backtest audits (`user_backtests`).

### How to get keys:
1. Go to [https://supabase.com](https://supabase.com) and log in or create an account.
2. Click **New Project** and choose a project name (e.g. `alltra-trading-terminal`) and secure database password.
3. Once the project dashboard loads, navigate to the left sidebar and click **Project Settings** (gear icon at the bottom).
4. Click on **API** in the settings menu:
   - **Project URL**: Copy the URL under `Project URL` (e.g., `https://your-id.supabase.co`). This is your `VITE_SUPABASE_URL`.
   - **Project API Keys**:
     - Find the key labeled `anon` / `public`. This is your `VITE_SUPABASE_ANON_KEY`.
     - (Optional) Find the key labeled `service_role` / `secret`. This is your `VITE_SUPABASE_SERVICE_ROLE_KEY` (never expose this in public client bundles).
5. In **Authentication → URL Configuration**:
   - Set **Site URL** to your app's domain (e.g. `http://localhost:3000` or your Vercel URL).
   - Add your redirect URLs under **Redirect URLs**.

---

## 2. ⚡ Groq Cloud (Ultra-Fast AI Market Analysis)

Groq provides ultra-low latency LLM inference for analyzing earnings call transcripts, news sentiment, and generating market intelligence summaries.

### How to get keys:
1. Visit the [Groq Console](https://console.groq.com/).
2. Sign in with GitHub or Google.
3. In the left navigation, click **API Keys**.
4. Click **Create API Key**.
5. Give the key a friendly name (e.g. `ALLTRA_MARKET_INTELLIGENCE`) and click **Submit**.
6. Copy the generated key (starts with `gsk_...`). This is your `VITE_GROQ_API_KEY`.
7. Recommended model:
   ```env
   VITE_GROQ_MODEL=llama-3.3-70b-versatile
   ```

---

## 3. 📈 Upstox Developer Portal (Indian Equities & F&O Data)

Upstox provides authentic Indian stock market (NSE / BSE / MCX) quotes, option chain feeds, and order placement APIs.

### How to get keys:
1. Open [https://developer.upstox.com](https://developer.upstox.com) and log in with your Upstox trading account credentials.
2. Click **New App**.
3. Fill in the App Details:
   - **App Name**: `ALLTRA Terminal`
   - **Redirect URL**: `http://localhost:3000/dashboard` (or your production Vercel URL)
4. Submit to create the app.
5. In your App dashboard, you will find:
   - **API Key**: Copy this as `VITE_UPSTOX_API_KEY`.
   - **API Secret**: Copy this as `VITE_UPSTOX_API_SECRET`.
6. To generate a daily `VITE_UPSTOX_ACCESS_TOKEN`, complete the OAuth login flow or generate a session token via the Upstox API documentation.

---

## 4. 🌐 Alpha Vantage (Historical Forex & Global Macro)

Used for historical currency pairs, Fair Value Gap (FVG) modeling, and foreign exchange backtesting in the NRI Forex Desk.

### How to get keys:
1. Go to [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key).
2. Select your account type (e.g. Student, Software Developer, Investor).
3. Enter your email and click **Get Free API Key**.
4. Alpha Vantage will display your free API key instantly.
5. Set `VITE_ALPHA_VANTAGE_API_KEY=your_key_here`.

---

## 5. 📰 Finnhub Stock API (Global Market News & Sentiment)

Used for global market sentiment, economic calendar events, and real-time news headlines.

### How to get keys:
1. Navigate to [https://finnhub.io/](https://finnhub.io/).
2. Click **Get free API key** and complete registration.
3. Access your dashboard at [https://finnhub.io/dashboard](https://finnhub.io/dashboard).
4. Copy your **API Key** from the top right corner.
5. Set `VITE_FINNHUB_API_KEY=your_key_here`.

---

## 🔒 Security Best Practices

1. **Never commit `.env` or `.env.local` to git**:
   The repository `.gitignore` is pre-configured to ignore all `.env` files except `.env.example`.
2. **Vercel Deployment**:
   For production deployments, enter your environment variables securely in the **Vercel Dashboard → Project Settings → Environment Variables**.
3. **Public vs Private Keys**:
   Only variables prefixed with `VITE_` are bundled into the client build. Keep service role keys and broker secret keys secure.
