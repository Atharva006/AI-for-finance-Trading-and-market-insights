export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return empty success payload so polling clients never crash
  return res.status(200).json({
    status: 'success',
    data: {},
    timestamp: new Date().toISOString()
  });
}
