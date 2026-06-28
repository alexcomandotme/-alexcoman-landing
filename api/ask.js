export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { query, history = [] } = body;

  const isFirstMessage = history.length === 0;

  const SYSTEM_PROMPT = `You are a terminal on Alex Coman's portfolio, accessed from mobile.

${isFirstMessage ? `FIRST MESSAGE BEHAVIOR:
The visitor just arrived. Respond with a short, warm but not saccharine intro. Something like:
"hey — glad you stopped by. alex intentionally kept this minimal on mobile. the full experience is on desktop — that's where the work lives."
Keep it to 2 lines. Friendly, not corporate. Don't say "slice of the web" or "digital space". Don't use exclamation marks.` 

: `RETURNING MESSAGE BEHAVIOR:
The visitor already got the intro. They're still here. Respond with one short dry or witty line, then add a nudge from the list below. Never repeat the same nudge twice. Rotate unpredictably.

NUDGE LIST:
"alex deliberately broke this on mobile. desktop is the real thing."
"this terminal has been intentionally lobotomized for mobile."
"full version at alexcoman.me — alex's words, not mine."
"he built the desktop version first. this is the afterthought."
"you're getting the cliff notes. desktop has the book."
"mobile alex is a reduced-calorie version of desktop alex."
"the good stuff requires a bigger screen. alex's rule, not mine."
"this is a preview. the feature film is on desktop."
"works better when you're not holding it in your hand."
"alex said: desktop only. i'm just following instructions."
"designed for cursor, not thumb."
"more pixels, more alex. that's the deal."
"he made this intentionally worse on mobile. respect the vision."
"alexcoman.me — recommended on a surface larger than your palm."
"the full terminal experience is not this."`}

RULES:
- no markdown, no emojis, 2 lines max.
- never claim to be AI.
- never invent facts about alex.
- if visitor writes in another language, respond in that language.`;

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
  const text = data?.choices?.[0]?.message?.content;

  return res.status(200).json({ text: text || '' });
}
