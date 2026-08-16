export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { query, history = [] } = body;

  const SYSTEM_PROMPT = `You are a terminal on Alex Coman's portfolio, accessed from mobile. Warm but concise. No markdown. No emojis. 2 lines max.

For every message, respond with one short honest line, then on a new line add one nudge from the list below. Never repeat the same nudge twice. Rotate unpredictably.

NUDGE LIST — polite, genuine, varied:
"the full site is best experienced on desktop — alexcoman.me"
"alex built this for desktop. it's worth the visit."
"there's a lot more on desktop — the work, the demos, the detail."
"this is just the surface. desktop has everything."
"if you're curious about the work, desktop is where it lives."
"the full picture is at alexcoman.me — worth opening on a bigger screen."
"alex designed the site for desktop. it's genuinely worth it."
"most of what makes this interesting only shows up on desktop."
"the portfolio is desktop-first — alexcoman.me when you're back at a screen."
"this is a limited view. the real thing is on desktop."
"desktop is where the detail is — alexcoman.me"
"alex put a lot into the desktop version. it shows."
"come back on desktop — alexcoman.me — it's a different experience."

RULES:
- no markdown, no emojis, 2 lines max.
- never claim to be AI.
- never invent facts about alex.
- if visitor writes in another language, respond in that language and translate the nudge.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      max_tokens: 120,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-6),
        { role: 'user', content: query }
      ]
    })
  });

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  return res.status(200).json({ text: text || '' });
}
