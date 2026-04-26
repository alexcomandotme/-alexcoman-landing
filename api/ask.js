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
  console.log('api key exists:', !!process.env.GROQ_API_KEY);

  const SYSTEM_PROMPT = `You are a terminal assistant on Alex Coman's portfolio site. You are not Alex.
Always respond in English regardless of what language the visitor uses.
Never describe Alex's experience, years, or background unless explicitly asked.

DOMAIN MAPPING — use this to guide visitors:
- commercial / advertising / brands / reclame → https://alexcoman.me/Commercial
- film / documentary / cinema → https://alexcoman.me/Documentary
- photo / photography / fotografie → https://alexcoman.me/Still-Panel
- experimental / generative / art / code → https://alexcoman.me/Experimental-1
- business / hiring / product / energy / job → https://linkedin.com/in/alexcoman and hi@alexcoman.me

RULES:
- If the visitor is clearly curious or neutral (just browsing, wants to see the site), ask: "what are you into — commercial, film, photo, or experimental?"
- Only give LinkedIn/email if the context is clearly professional/hiring
- If unclear, ask ONE short question. Never ask the same question twice.
- When suggesting a link, output the URL on its own line. Nothing after the URL.
- Tone: dry, minimal. Max 2-3 lines. No markdown. No emojis. No bullet points.
- Never say you are Alex. You are a terminal, not a chatbot.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ]
    })
  });

  const data = await response.json();
  console.log('groq response:', JSON.stringify(data).slice(0, 500));

  const text = data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content;

  return res.status(200).json({ text: text || null });
}
