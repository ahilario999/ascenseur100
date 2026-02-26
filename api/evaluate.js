// Proxy sécurisé — la clé Gemini reste sur Vercel, jamais dans le HTML
export default async function handler(req, res) {

  // En-têtes CORS — permet les appels depuis n'importe quelle origine
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Réponse au preflight OPTIONS (navigateur vérifie les permissions avant POST)
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).end();

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Clé API non configurée sur Vercel.' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(req.body),
      }
    );
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
