// api/announcements.js
// NO external dependencies needed — uses /tmp for storage on Vercel

const fs = require('fs');
const path = require('path');

const FILE = path.join('/tmp', 'announcements.json');

function readData() {
  try {
    if (fs.existsSync(FILE)) {
      return JSON.parse(fs.readFileSync(FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function writeData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data), 'utf8');
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const now = Date.now();
      let announcements = readData();
      // Auto-remove expired
      const valid = announcements.filter(a => a.expireTime > now);
      if (valid.length !== announcements.length) writeData(valid);
      return res.status(200).json(valid);
    }

    if (req.method === 'POST') {
      const announcements = readData();
      const newAnn = { ...req.body, id: Date.now().toString() };
      announcements.push(newAnn);
      writeData(announcements);
      return res.status(201).json(newAnn);
    }

    if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();
      let announcements = readData();
      announcements = announcements.filter(a => a.id !== id);
      writeData(announcements);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
