# ALLTRA — Institutional Quantitative Workstation & Systematic Trading Platform

![ALLTRA Terminal](https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80)

ALLTRA is an institutional-grade algorithmic research and systematic trading terminal engineered for Indian financial markets (NSE, BSE, MCX) and global cross-currency desks. It provides bar-by-bar deterministic quantitative backtesting, live market breadth heatmaps, virtual paper trading execution, historical bar replay, and comprehensive telemetry sync with Supabase Cloud.

---

## 🚀 Key Modules & Architecture

1. **Market Overview & Real-Time Telemetry** (`/market-overview`)
   - Live benchmark feeds for NIFTY 50, NIFTY BANK, SENSEX, and sector indices.
   - Real-time tick animations, percentage changes, dynamic highs/lows, and sectoral divergence bars.
   - Quick navigation into execution desks and active contracts.

2. **Official TradingView Market Heatmaps** (`/market-heatmaps`)
   - Direct integration of TradingView's official `<tv-heatmap>` Web Component.
   - Supports **Indian Markets (BSE SENSEX)** and **US Markets (S&P 500)**.
   - Group by Sector with dynamic block sizing by Market Cap or Volume.

3. **Virtual Paper Trading Desk** (`/dashboard`)
   - Multi-asset virtual execution desk supporting Indian Equities, F&O Derivatives, and MCX Commodities.
   - Real-time order book, active positions, portfolio P&L tracking, holdings analytics, and execution journal.
   - Sub-tick simulation with zero slippage anomalies.

4. **Candle-by-Candle Bar Replay Studio** (`/bar-replay`)
   - High-fidelity forward-testing sandbox allowing traders to replay past market regimes bar-by-bar across 15m and 1D timeframes.
   - Test mechanical entries and stop placement without lookahead bias.

5. **Deterministic Backtest Studio** (`/trading-algorithms/backtesting-studio`)
   - Vectorized, bar-by-bar backtesting engine operating across authentic historical daily candles.
   - Evaluates Parabolic SAR (PSAR SMA 100), Opening Range Breakout (ORB 5M), Stochastic ATR inflections, and options credit spreads.
   - Produces comprehensive equity curves, drawdown underwater charts, monthly return heatmaps, and Sharpe/Sortino ratios.

6. **Algorithmic Strategy Marketplace** (`/trading-algorithms`)
   - Curated repository of verified systematic strategies and automated multi-asset investment baskets.
   - Filter by capital tier, volatility regime, asset class, and risk profile.

7. **Market Pulse & Con Call Intelligence** (`/market-insights`)
   - AI-assisted analysis of earnings call transcripts, SEBI corporate filings, and corporate governance records.

8. **NRI Forex & FVG Desk** (`/forex`)
   - Institutional cross-currency rate analysis and Fair Value Gap (FVG) algorithmic models for international and NRI traders.

9. **Strategy Compiler & Admin Portal** (`/admin`)
   - Restricted institutional administration workspace for configuring, stress-testing, and deploying algorithmic strategies.

10. **Full-Fidelity Supabase Audit Ledger & Telemetry**
    - Automatic session tracking with live heartbeats, device metadata, and platform duration in `user_sessions`.
    - Real-time trade journal recording every BUY/SELL order with execution price and PnL in `user_orders`.
    - Backtest audit log saving test metrics and performance distributions in `user_backtests`.

---

## 🛠️ Environment Variables Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

| Variable Name | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | Project URL of your connected Supabase instance | `https://prucyogtorkhldzjbzow.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | Supabase anonymous / public publishable API key | `sb_publishable_Mikas1X03ROxjzI2QgwZBA_Rpgeci_g` |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | *Optional* | Supabase service role key (for server-side metadata sync) | `eyJhbGciOi...` |
| `VITE_GROQ_API_KEY` | *Optional* | Groq Cloud API Key for ultra-fast Llama market audits | `gsk_...` |
| `VITE_GROQ_MODEL` | *Optional* | Groq AI model identifier | `meta-llama/llama-prompt-guard-2-86m` |
| `VITE_UPSTOX_ACCESS_TOKEN` | *Optional* | Upstox API v2 Access Token for live Indian market feeds | Bearer token string |
| `VITE_UPSTOX_API_KEY` | *Optional* | Upstox Developer App API Key | API Key string |
| `VITE_UPSTOX_API_SECRET` | *Optional* | Upstox Developer App Secret | Secret string |
| `VITE_UPSTOX_REDIRECT_URI` | *Optional* | OAuth redirect callback URI for Upstox broker login | `http://localhost:3000/dashboard` |
| `VITE_GATEWAY_SECURITY_PIN` | *Optional* | Administrative gateway PIN for sensitive order operations | `1234` |
| `VITE_GATEWAY_SECURITY_HASH` | *Optional* | Gateway validation hash | Security hash string |

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (recommended: `v20.x`)
- **npm** or **pnpm**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Atharva006/AI-for-finance-Trading-and-market-insights.git
cd AI-for-finance-Trading-and-market-insights

# Install dependencies
npm install
```

### 3. Local Development
```bash
# Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Verification
```bash
# Run TypeScript compilation and Vite production bundle
npm run build
```

---

## 🚢 Deployment on Vercel

When deploying to Vercel:

1. **Root Directory**: Select repository root (`/`).
2. **Framework Preset**: `Vite`.
3. **Build Command**: `npm run build` (`tsc && vite build`).
4. **Output Directory**: `dist`.
5. **Environment Variables**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Vercel Project Settings → Environment Variables**.
6. **Supabase Auth Redirect Configuration**:
   - In your Supabase Dashboard, navigate to **Authentication → URL Configuration**.
   - Under **Site URL**, provide your Vercel deployment URL (e.g. `https://your-project.vercel.app`).
   - Under **Redirect URLs**, add:
     - `https://your-project.vercel.app/**`
     - `https://your-project.vercel.app/market-overview`
     - `http://localhost:3000/**` (for local development)

---

## 🔒 Institutional Access Control

Access to strategy compilation, risk controls, and administrative audit interfaces is governed by enterprise Role-Based Access Control (RBAC) via Supabase Auth and token authorization. Google OAuth and email logins are routed securely through Supabase identity providers without exposed default credentials.

---

## 📄 License & Disclaimer

All backtesting, paper trading, and replay metrics presented within ALLTRA are for educational and quantitative simulation purposes only. Past performance evaluated across historical market regimes does not guarantee future results.

---

## 👨‍💻 Author & Maintainer

- **Atharva Bhosale**
  - **LinkedIn**: [linkedin.com/in/atharva--bhosale](https://www.linkedin.com/in/atharva--bhosale/)
  - **GitHub**: [@Atharva006](https://github.com/Atharva006)
  - Quantitative trader, algorithmic systems developer, and prop-funded practitioner (FundingPips, The 5%ers).
