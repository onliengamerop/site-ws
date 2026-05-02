// api/scripts.js
// Vercel Serverless API for Ajjan Script Hub
// Uses Vercel KV (or a simple JSON file via filesystem for dev)
// Deploy this to your Vercel project

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Allow CORS for your hub site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // GET /api/scripts — return all scripts
      const scripts = (await kv.get('scripts')) || [];
      return res.status(200).json(scripts);
    }

    if (req.method === 'POST') {
      // POST /api/scripts — add new script
      const scripts = (await kv.get('scripts')) || [];
      const newScript = { ...req.body, id: Date.now().toString() };
      scripts.push(newScript);
      await kv.set('scripts', scripts);
      return res.status(201).json(newScript);
    }

    if (req.method === 'PUT') {
      // PUT /api/scripts/:id — edit script
      const { id } = req.query;
      const scripts = (await kv.get('scripts')) || [];
      const idx = scripts.findIndex(s => s.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      scripts[idx] = { ...scripts[idx], ...req.body };
      await kv.set('scripts', scripts);
      return res.status(200).json(scripts[idx]);
    }

    if (req.method === 'DELETE') {
      // DELETE /api/scripts/:id — delete script
      const { id } = req.query;
      let scripts = (await kv.get('scripts')) || [];
      scripts = scripts.filter(s => s.id !== id);
      await kv.set('scripts', scripts);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
