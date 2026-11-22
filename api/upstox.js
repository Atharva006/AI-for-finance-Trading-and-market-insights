const DEFAULT_UPSTOX_ACCESS_TOKEN =
  process.env.VITE_UPSTOX_ACCESS_TOKEN ||
  process.env.UPSTOX_ACCESS_TOKEN ||
  'eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiIzQkNQVjYiLCJqdGkiOiI2YWQyMjE0MTg1MjEwZDJlZDE0M2FjYzMiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlzRXh0ZW5kZWQiOnRydWUsImlhdCI6MTc5MjE1NTk2OSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxODIzNzI0MDAwfQ.slbHonDXTfVeWGkAvvbWAxzEJfk4xJQnn41P5M635yQ';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path: queryPath, ...restParams } = req.query;
  const queryString = new URLSearchParams(restParams).toString();
  const rawPath = queryPath ? `${queryPath}${queryString ? '?' + queryString : ''}` : '';
  const targetUrl = `https://api.upstox.com/${rawPath}`;

  const authHeader = req.headers['authorization'] || `Bearer ${DEFAULT_UPSTOX_ACCESS_TOKEN}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Accept: 'application/json',
        Authorization: authHeader,
      },
    });

    const data = await upstreamRes.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(upstreamRes.status).send(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to proxy request to Upstox API', details: err.message });
  }
}
