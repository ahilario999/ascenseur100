// Proxy sécurisé — la clé Gemini reste sur Vercel, jamais dans le HTML
export default async function handler(req, res) {

  // CORS — restreint aux origines autorisées
  const origin = req.headers.origin || '';
  const allowed = ['https://ascenseur100.vercel.app', 'http://localhost', 'http://127.0.0.1'];
  const corsOrigin = allowed.some(a => origin.startsWith(a)) ? origin : allowed[0];
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non permise.' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY non configurée sur Vercel.' });

  // gemini-1.5-flash = stable et disponible sur le free tier
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    if (!response.ok) console.error('[PROXY] Gemini ' + response.status + ':', JSON.stringify(data));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[PROXY] Erreur réseau:', err.message);
    res.status(500).json({ error: 'Erreur de connexion Gemini.', detail: err.message });
  }
}
