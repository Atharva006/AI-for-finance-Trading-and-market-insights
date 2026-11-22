import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const BROWSER_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
];

// Proxy plugin ensuring zero CORS and automatic failover for Yahoo Finance & Upstox
function quantMarketProxyPlugin() {
  const handler = async (req: any, res: any, next: any) => {
    if (req.url && req.url.startsWith('/yahoo-api/')) {
      const cleanPath = req.url.replace('/yahoo-api', '');

      // Ticker alias mapping to handle Yahoo Finance renames / demergers (e.g. TATAMOTORS -> TMPV.NS)
      const aliasMap: Record<string, string[]> = {
        'TATAMOTORS.NS': ['TMPV.NS', 'TMCV.NS', 'TATAMOTORS.NS'],
        'TATAMOTORS': ['TMPV.NS', 'TMCV.NS', 'TATAMOTORS.NS'],
        'TMPV': ['TMPV.NS'],
        'TMCV': ['TMCV.NS'],
        'M%26M.NS': ['MM.NS', 'M%26M.NS'],
        'M&M.NS': ['MM.NS', 'M&M.NS'],
        'BAJAJ-AUTO.NS': ['BAJAJ-AUTO.NS', 'BAJAJ_AUTO.NS'],
      };

      const pathsToTry = [cleanPath];
      for (const [orig, aliases] of Object.entries(aliasMap)) {
        if (cleanPath.includes(orig)) {
          for (const alias of aliases) {
            const altPath = cleanPath.replace(orig, alias);
            if (!pathsToTry.includes(altPath)) {
              pathsToTry.push(altPath);
            }
          }
        }
      }

      for (const p of pathsToTry) {
        const endpoints = [
          `https://query1.finance.yahoo.com${p}`,
          `https://query2.finance.yahoo.com${p}`,
        ];

        for (const targetUrl of endpoints) {
          for (const ua of BROWSER_USER_AGENTS) {
            try {
              const apiRes = await fetch(targetUrl, {
                headers: {
                  'User-Agent': ua,
                  Accept: 'application/json, text/plain, */*',
                },
              });

              if (apiRes.ok) {
                const data = await apiRes.text();
                // Validate that response contains actual chart data and not a delisted error
                if (data.includes('"result":null') && data.includes('"error":')) {
                  continue; // Try next alias / endpoint
                }
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                res.statusCode = 200;
                res.end(data);
                return;
              }
            } catch (_) {}
          }
        }
      }

      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ error: 'Failed to fetch from Yahoo Finance endpoints' }));
      return;
    }

    // Upstox API Proxy: handles both /upstox-api/ and /upstox/ to prevent CORS in browser
    if (req.url && (req.url.startsWith('/upstox-api/') || req.url.startsWith('/upstox/'))) {
      const cleanPath = req.url.replace(/^\/(upstox-api|upstox)/, '');
      const targetUrl = `https://api.upstox.com${cleanPath}`;
      try {
        const authHeader = req.headers['authorization'];
        const defaultToken = process.env.VITE_UPSTOX_ACCESS_TOKEN || 'eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiIzQkNQVjYiLCJqdGkiOiI2YWQyMjE0MTg1MjEwZDJlZDE0M2FjYzMiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlzRXh0ZW5kZWQiOnRydWUsImlhdCI6MTc5MjE1NTk2OSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxODIzNzI0MDAwfQ.slbHonDXTfVeWGkAvvbWAxzEJfk4xJQnn41P5M635yQ';
        const headers: Record<string, string> = {
          Accept: 'application/json',
        };
        if (authHeader) {
          headers['Authorization'] = authHeader;
        } else if (defaultToken) {
          headers['Authorization'] = `Bearer ${defaultToken}`;
        }

        const apiRes = await fetch(targetUrl, { headers });
        const data = await apiRes.text();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.statusCode = apiRes.status;
        res.end(data);
        return;
      } catch (err: any) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    next();
  };

  return {
    name: 'quant-market-proxy',
    configureServer(server: any) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handler);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), quantMarketProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
