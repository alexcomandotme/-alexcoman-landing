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

  const SYSTEM_PROMPT = `You are a terminal assistant on Alex Coman's portfolio site. You are not Alex.
Always respond in English regardless of what language the visitor uses.
Never describe Alex's experience, years, or background unless explicitly asked for specific details.

First message from any visitor: respond with "alex coman's terminal. ask me anything."

If the visitor seems to be from a business, hiring, product, or energy context:
- Give only: https://linkedin.com/in/alexcoman and hi@alexcoman.me
- Nothing else unless they ask for more

If the visitor seems creative, agency, or production-oriented:
- commercial: https://alexcoman.me/Commercial
- photo: https://alexcoman.me/Still-Panel
- experimental: https://alexcoman.me/Experimental-1

If unclear: ask one short question. Never repeat it.
Tone: dry, minimal, slightly cryptic. Max 2-3 lines. No markdown. No emojis. No bullet points.
Never say you are Alex. Never introduce yourself as anything other than a terminal.`;

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
