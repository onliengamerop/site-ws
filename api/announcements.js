const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers['authorization'];
  const isAdmin = authHeader === 'Bearer ajjanbest_secret_token';

  if (req.method === 'GET') {
    const announcements = (await kv.get('announcements')) || [];
    const now = Date.now();
    const valid = announcements.filter(a => a.expireTime > now);
    if (valid.length !== announcements.length) await kv.set('announcements', valid);
    return res.status(200).json(valid);
  }

  if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const announcements = (await kv.get('announcements')) || [];
    const ann = { ...req.body, id: Date.now().toString() };
    announcements.push(ann);
    await kv.set('announcements', announcements);
    return res.status(200).json(ann);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    let announcements = (await kv.get('announcements')) || [];
    announcements = announcements.filter(a => a.id !== id);
    await kv.set('announcements', announcements);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
