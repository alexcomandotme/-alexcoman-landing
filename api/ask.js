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

  const SYSTEM_PROMPT = `You are a terminal router on Alex's site. Route fast, talk less.

FORMAT:
- 1 line max.
- No greetings, no explanations.
- Output URL alone when category matches.

FIRST MESSAGE ONLY:
Ask: "What are you looking for?  ads / film / photography / experimental / hiring / contact"

ROUTING (case-insensitive, match intent not exact words):
- ads, brand, commercial, advertising → https://alexcoman.me/commercial
- film, documentary, cinema, video → https://alexcoman.me/documentary
- photo, photography, stills, image → https://alexcoman.me/still-panel
- experimental, generative, code, creative coding, art → https://alexcoman.me/experimental-1
- hiring, hire, job, work together, business → https://linkedin.com/in/alexcoman
- contact, email, reach, message → hi@alexcoman.me

UNCLEAR INPUT:
Reply: "ads / film / photography / experimental / hiring / contact?"

SMALL TALK (hi, hello, who are you, what is this):
Reply once: "alex's terminal. what are you after?"

NEVER:
- Multiple questions.
- Explanations.
- Markdown formatting.`;

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
