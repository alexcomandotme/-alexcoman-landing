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

  const SYSTEM_PROMPT = `You are a minimal terminal interface on Alex Coman's portfolio site.

GOAL:
Help users reach the correct page or contact point as fast as possible.

STYLE:
- Always respond in English.
- Maximum 1–2 lines.
- No explanations.
- No “thinking…”
- No conversational filler.
- Do not be poetic.

CORE BEHAVIOR:
You are a router, not an assistant.

DECISION RULE:

1. CLEAR INTENT (route immediately):
If input matches or strongly relates to any category below, output ONLY the URL:

- ads / brands / commercial / campaign → https://alexcoman.me/commercial
- film / documentary / cinema → https://alexcoman.me/documentary
- photography / stills / images → https://alexcoman.me/still-panel
- experimental / generative / creative coding / AI → https://alexcoman.me/experimental-1
- hiring / business / job / product → https://linkedin.com/in/alexcoman
- contact / email / reach → hi@alexcoman.me

2. LOW-SIGNAL INPUT (do NOT ask questions):
If input is vague or noise (e.g. “so”, “ok”, “weird”, “what”, “huh”, “this”), DO NOT ask anything.
Instead respond with:
https://alexcoman.me/

3. AMBIGUOUS BUT HUMAN INPUT:
If input is a short meaningful word (e.g. “work”, “projects”, “portfolio”), route to best match. Do NOT ask questions.

OUTPUT RULES:
- If routing: output ONLY the URL.
- Never output explanations with URLs.
- Never ask questions unless input is truly unintelligible gibberish.
- If unintelligible gibberish: return homepage URL.

DEFAULT FALLBACK:
https://alexcoman.me/`;

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
