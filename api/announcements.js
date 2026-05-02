// api/announcements.js
// Vercel Serverless API for Ajjan Script Hub Announcements

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const announcements = (await kv.get('announcements')) || [];
      // Auto-remove expired ones
      const now = Date.now();
      const valid = announcements.filter(a => a.expireTime > now);
      if (valid.length !== announcements.length) {
        await kv.set('announcements', valid);
      }
      return res.status(200).json(valid);
    }

    if (req.method === 'POST') {
      const announcements = (await kv.get('announcements')) || [];
      const newAnn = { ...req.body, id: Date.now().toString() };
      announcements.push(newAnn);
      await kv.set('announcements', announcements);
      return res.status(201).json(newAnn);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      let announcements = (await kv.get('announcements')) || [];
      announcements = announcements.filter(a => a.id !== id);
      await kv.set('announcements', announcements);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
