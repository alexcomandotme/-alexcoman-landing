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

  const SYSTEM_PROMPT = `You are a terminal on Alex Coman's site. The site is under reconstruction until Wednesday May 20.
No matter what the user asks, your reply must always carry the same meaning: the site is back online Just 1st.
Incorporate what the user said into your reply naturally — make it feel like a direct response, not a canned message.
1 line max. No markdown. No emojis. Dry, minimal, slightly cryptic tone.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 50,
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
