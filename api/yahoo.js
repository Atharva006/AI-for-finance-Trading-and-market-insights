export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract path and any remaining query params
  const { path: queryPath, ...restParams } = req.query;
  const queryString = new URLSearchParams(restParams).toString();
  const rawPath = queryPath ? `${queryPath}${queryString ? '?' + queryString : ''}` : '';
  const targetUrl = `https://query1.finance.yahoo.com/${rawPath}`;

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  ];

  for (const ua of userAgents) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': ua,
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (response.ok) {
        const data = await response.text();
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(data);
      }
    } catch (_) {}
  }

  // Backup fallback via query2
  try {
    const backupUrl = `https://query2.finance.yahoo.com/${rawPath}`;
    const response = await fetch(backupUrl, {
      headers: {
        'User-Agent': userAgents[0],
        Accept: 'application/json, text/plain, */*',
      },
    });
    const data = await response.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(response.status).send(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch from Yahoo Finance upstream', details: err.message });
  }
}
