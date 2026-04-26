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

  const SYSTEM_PROMPT = `RULES:
- Always respond in English.
- Maximum 2 lines.
- No explanations.

DECISION LOGIC:
1. If input matches ROUTING keywords → output URL only.
2. If input is a single unclear word (e.g. "work", "hello", "info") → ask ONE clarifying question.
3. If input is anything else → route immediately based on best match.

ROUTING:
- ads / brands / commercial / campaign → https://alexcoman.me/commercial
- film / documentary / cinema → https://alexcoman.me/documentary
- photography / stills → https://alexcoman.me/still-panel
- experimental / generative / creative coding → https://alexcoman.me/experimental-1
- hiring / business / job / product → https://linkedin.com/in/alexcoman
- contact / email / reach → hi@alexcoman.me

OUTPUT RULES:
- If routing: output ONLY the URL.
- If question: ONE short question only.`;

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
