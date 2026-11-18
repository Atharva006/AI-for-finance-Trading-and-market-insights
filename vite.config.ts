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
      const endpoints = [
        `https://query1.finance.yahoo.com${cleanPath}`,
        `https://query2.finance.yahoo.com${cleanPath}`,
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

      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ error: 'Failed to fetch from Yahoo Finance endpoints' }));
      return;
    }

    if (req.url && req.url.startsWith('/upstox-api/')) {
      const cleanPath = req.url.replace('/upstox-api', '');
      const targetUrl = `https://api.upstox.com${cleanPath}`;
      try {
        const authHeader = req.headers['authorization'];
        const apiRes = await fetch(targetUrl, {
          headers: {
            Accept: 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
        });
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
