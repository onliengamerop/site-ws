const fs = require('fs');
const path = require('path');
const FILE = path.join('/tmp', 'scripts.json');

function readData() {
  try {
    if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (e) {}
  return [];
}

function writeData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data), 'utf8');
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      return res.status(200).json(readData());
    }

    if (req.method === 'POST') {
      const scripts = readData();
      const newScript = { ...req.body, id: Date.now().toString() };
      scripts.push(newScript);
      writeData(scripts);
      return res.status(201).json(newScript);
    }

    if (req.method === 'PUT') {
      // Support both /api/scripts/ID and /api/scripts?id=ID
      const id = req.query.id || req.url.split('/').pop();
      const scripts = readData();
      const idx = scripts.findIndex(s => s.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      scripts[idx] = { ...scripts[idx], ...req.body };
      writeData(scripts);
      return res.status(200).json(scripts[idx]);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.url.split('/').pop();
      let scripts = readData();
      scripts = scripts.filter(s => s.id !== id);
      writeData(scripts);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
