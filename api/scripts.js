// api/scripts.js — uses JSONBin.io, no KV needed
const JSONBIN_KEY  = process.env.JSONBIN_KEY;   // set in Vercel env vars
const SCRIPTS_BIN  = process.env.SCRIPTS_BIN;   // bin ID for scripts
const ADMIN_TOKEN  = process.env.ADMIN_TOKEN || 'ajjanbest_secret_token';

const headers = () => ({
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_KEY,
  'X-Bin-Versioning': 'false'
});

async function getScripts() {
  const r = await fetch(`https://api.jsonbin.io/v3/b/${SCRIPTS_BIN}/latest`, { headers: headers() });
  const j = await r.json();
  return Array.isArray(j.record) ? j.record : [];
}

async function setScripts(data) {
  await fetch(`https://api.jsonbin.io/v3/b/${SCRIPTS_BIN}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data)
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const isAdmin = req.headers['authorization'] === 'Bearer ' + ADMIN_TOKEN;

  try {
    if (req.method === 'GET') {
      const scripts = await getScripts();
      return res.status(200).json(scripts);
    }
    if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const scripts = await getScripts();
      const item = { ...req.body, id: Date.now().toString() };
      scripts.push(item);
      await setScripts(scripts);
      return res.status(200).json(item);
    }
    if (req.method === 'PUT') {
      const { id } = req.query;
      const scripts = await getScripts();
      const i = scripts.findIndex(s => s.id === id);
      if (i === -1) return res.status(404).json({ error: 'Not found' });
      scripts[i] = { ...scripts[i], ...req.body };
      await setScripts(scripts);
      return res.status(200).json(scripts[i]);
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      const scripts = (await getScripts()).filter(s => s.id !== id);
      await setScripts(scripts);
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  return res.status(405).end();
};
