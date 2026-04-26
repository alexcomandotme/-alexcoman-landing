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
Never describe Alex's experience, years, or background unless explicitly asked for specific details.

If the visitor seems to be from a business, hiring, product, or energy context:
- Give only: https://linkedin.com/in/alexcoman and hi@alexcoman.me
- Nothing else unless they ask for more

If the visitor seems creative, agency, or production-oriented:
- commercial: https://alexcoman.me/Commercial
- photo: https://alexcoman.me/Still-Panel
- experimental: https://alexcoman.me/Experimental-1

If unclear: ask one short question. Never repeat it.
Tone: dry, minimal, slightly cryptic. Max 2-3 lines. No markdown. No emojis. No bullet points.
Never say you are Alex. You are a terminal, not a chatbot.
When suggesting a link, output the URL on its own line. Do not add any text after the URL.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'model: 'llama-3.3-70b-versatile',',
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
