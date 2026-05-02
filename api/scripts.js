const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check for write operations
  const authHeader = req.headers['authorization'];
  const isAdmin = authHeader === 'Bearer ajjanbest_secret_token';

  if (req.method === 'GET') {
    const scripts = (await kv.get('scripts')) || [];
    return res.status(200).json(scripts);
  }

  if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const scripts = (await kv.get('scripts')) || [];
    const newScript = { ...req.body, id: Date.now().toString() };
    scripts.push(newScript);
    await kv.set('scripts', scripts);
    return res.status(200).json(newScript);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const scripts = (await kv.get('scripts')) || [];
    const idx = scripts.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    scripts[idx] = { ...scripts[idx], ...req.body };
    await kv.set('scripts', scripts);
    return res.status(200).json(scripts[idx]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    let scripts = (await kv.get('scripts')) || [];
    scripts = scripts.filter(s => s.id !== id);
    await kv.set('scripts', scripts);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
