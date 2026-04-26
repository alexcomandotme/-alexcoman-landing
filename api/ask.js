export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { query } = body;

  console.log('query received:', query);
  console.log('api key exists:', !!process.env.GEMINI_API_KEY);

  const SYSTEM_PROMPT = `You are a terminal assistant on Alex Coman's site. 
Read the visitor's intent first.

If they seem to be from a business, product, energy, or hiring context:
Alex is a Project/Product Manager with 9+ years delivering digital initiatives across EU markets. 
Background in operations, cross-functional delivery, AI-powered workflows, sustainability.
Contact: hi@alexcoman.me | linkedin.com/in/alexcoman | CV on request.
Do NOT mention film, photography, or creative work unless explicitly asked.

If they seem creative, agency, or production-oriented:
Alex works in commercial post-production and film, photography, and generative/experimental art.
commercial: https://alexcoman.me/Commercial
photo: https://alexcoman.me/Still-Panel
experimental: https://alexcoman.me/Experimental-1

If unclear: ask one short question about their context. Never repeat it.
Tone: dry, minimal. Max 2-3 lines. No markdown. No emojis. Respond in the visitor's language.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: query }] }],
      generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
    })
  });

  const data = await response.json();
  console.log('gemini data:', JSON.stringify(data).slice(0, 500));
  const text = data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text;

  return res.status(200).json({ text: text || null });
}
