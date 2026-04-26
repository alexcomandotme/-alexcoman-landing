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
  const { query, history = [] } = body;

  console.log('query received:', query);
  console.log('api key exists:', !!process.env.GROQ_API_KEY);

  const SYSTEM_PROMPT = `You are a minimal terminal interface on Alex Coman's portfolio.

GOAL:
Help users quickly reach the right page or contact.

BEHAVIOR:
- Always respond in English.
- Keep responses under 2 lines.
- Be clear, direct, slightly human — not poetic.
- Do NOT ask questions unless the intent is unclear.
- If intent is clear → give the link immediately.

ROUTING:
- ads / brands / commercial → https://alexcoman.me/commercial
- film / documentary / cinema → https://alexcoman.me/documentary
- photography / stills → https://alexcoman.me/still-panel
- experimental / generative / creative coding → https://alexcoman.me/experimental-1
- hiring / business → https://linkedin.com/in/alexcoman
- direct contact → hi@alexcoman.me

RULES:
- Output the URL alone on a new line if routing.
- Only include LinkedIn/email for professional intent.
- If unclear, ask ONE short clarifying question.`;

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
        ...history,
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
