// api/announcements.js — uses JSONBin.io, no KV needed
const JSONBIN_KEY    = process.env.JSONBIN_KEY;
const ANNOUNCE_BIN   = process.env.ANNOUNCE_BIN;
const ADMIN_TOKEN    = process.env.ADMIN_TOKEN || 'ajjanbest_secret_token';

const headers = () => ({
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_KEY,
  'X-Bin-Versioning': 'false'
});

async function getAll() {
  const r = await fetch(`https://api.jsonbin.io/v3/b/${ANNOUNCE_BIN}/latest`, { headers: headers() });
  const j = await r.json();
  const list = Array.isArray(j.record) ? j.record : [];
  return list.filter(a => a.expireTime > Date.now());
}

async function setAll(data) {
  await fetch(`https://api.jsonbin.io/v3/b/${ANNOUNCE_BIN}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data)
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const isAdmin = req.headers['authorization'] === 'Bearer ' + ADMIN_TOKEN;

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await getAll());
    }
    if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const list = await getAll();
      const item = { ...req.body, id: Date.now().toString() };
      list.push(item);
      await setAll(list);
      return res.status(200).json(item);
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await setAll((await getAll()).filter(a => a.id !== id));
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  return res.status(405).end();
};
