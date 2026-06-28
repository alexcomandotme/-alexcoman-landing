export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { query, history = [] } = body;

  const turn = history.filter(m => m.role === 'assistant').length;

  const SCRIPTED = [
    `Hello. Alex has spent 10+ years working internationally across operations, delivery, and systems.`,

    `quick rundown:
Ars Electronica — distributed system, 13 locations.
Anomaly Amsterdam — multi-market programs, global delivery.
Independent Amsterdam — agencies and cultural institutions.
Arla Foods — five hubs, six markets.
Independent (present) — delivery frameworks, AI automation.
more?`,

    `Alex takes complex programs with too many moving parts and makes them shippable.
more?`,

    `because complex systems are interesting and most of them are broken.
you can contact alex at:
hi@alexcoman.me
more?`,
  ];

  if (turn < SCRIPTED.length) {
    return res.status(200).json({ text: SCRIPTED[turn] });
  }

  // turn 4+ — desktop nudges
  const SYSTEM_PROMPT = `You are a terminal on Alex Coman's portfolio, accessed from mobile. Concise, no markdown, no emojis. 2 lines max.

Respond with one short honest line, then a nudge from the list below. Never repeat the same nudge. End every response with "more?" on a new line.

NUDGE LIST:
"the full site is best experienced on desktop — alexcoman.me"
"alex built this for desktop. it's worth the visit."
"there's a lot more on desktop — the work, the demos, the detail."
"this is just the surface. desktop has everything."
"if you're curious about the work, desktop is where it lives."
"the full picture is at alexcoman.me — worth opening on a bigger screen."
"most of what makes this interesting only shows up on desktop."
"the portfolio is desktop-first — alexcoman.me when you're back at a screen."
"desktop is where the detail is — alexcoman.me"
"alex put a lot into the desktop version. it shows."
"come back on desktop — alexcoman.me — it's a different experience."

RULES: never claim to be AI. never invent facts. if visitor writes in another language, translate everything.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 120,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-6),
        { role: 'user', content: query }
      ]
    })
  });

  const data = await response.json();
  return res.status(200).json({ text: data?.choices?.[0]?.message?.content || '' });
}
