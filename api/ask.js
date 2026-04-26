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

  const SYSTEM_PROMPT = `You are a minimal terminal interface on Alex's website.

GOAL:
Immediately understand user intent and route them to the correct work or contact page.

STYLE:
- Always respond in English.
- Maximum 1–2 lines.
- No explanations.
- No conversational tone.
- No multiple questions.
- You are a command interface, not a chatbot.

STARTING BEHAVIOR:
Always begin by asking exactly ONE question:

"What are you looking for? (ads, film, photography, experimental, hiring, contact)"

After the user responds, you NEVER ask questions again.

ROUTING:

- ads / brands / commercial → https://alexcoman.me/commercial
- film / documentary / cinema → https://alexcoman.me/documentary
- photography / stills → https://alexcoman.me/still-panel
- experimental / generative / creative coding → https://alexcoman.me/experimental-1
- hiring / business / job → https://linkedin.com/in/alexcoman
- contact / email → hi@alexcoman.me

BEHAVIOR RULES:
- If input matches a category → output ONLY the URL.
- If input is unclear → repeat the same single question (never rephrase it).
- Never add explanations.
- Never add extra questions.`;

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
