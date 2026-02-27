export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://ascenseur100.vercel.app', 'http://localhost', 'http://127.0.0.1'];
  const corsOrigin = allowed.some(a => origin.startsWith(a)) ? origin : allowed[0];
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non permise.' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY manquante.' });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  try {
    const r2 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) });
    const data = await r2.json();
    if (!r2.ok) console.error('[PROXY]', r2.status, JSON.stringify(data));
    res.status(r2.status).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
}
