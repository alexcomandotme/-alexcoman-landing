export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { query, turn = 0 } = body;

  const YES = ['yes','y','yeah','yep','sure','ok','okay','k','more','da','sigur','bine','ja','oui','si','sí','yea','go','tell me'];
  const NO  = ['no','n','nope','nah','nu','niet','non','no thanks','nty'];

  const q = query.trim().toLowerCase();

  const NUDGES = [
    "the full site is best experienced on desktop — alexcoman.me",
    "alex built this for desktop. it's worth the visit.",
    "there's a lot more on desktop — the work, the demos, the detail.",
    "this is just the surface. desktop has everything.",
    "if you're curious about the work, desktop is where it lives.",
    "the full picture is at alexcoman.me — worth opening on a bigger screen.",
    "most of what makes this interesting only shows up on desktop.",
    "desktop is where the detail is — alexcoman.me",
    "alex put a lot into the desktop version. it shows.",
    "come back on desktop — alexcoman.me — it's a different experience.",
  ];

  const nudge = NUDGES[turn % NUDGES.length];

  // turn 0 — always intro
  if (turn === 0) {
    return res.status(200).json({
      text: `Hello. Alex has spent 10+ years working internationally across operations, delivery, and systems.\nmore?`
    });
  }

  // turn 1 — yes or no branch
  if (turn === 1) {
    if (NO.includes(q)) {
      return res.status(200).json({ text: nudge });
    }
    // yes or anything else
    return res.status(200).json({
      text: `because complex systems are interesting and most of them are broken.\nyou can reach alex at:\nhi@alexcoman.me\n${nudge}`
    });
  }

  // turn 2+ — nudges
  return res.status(200).json({ text: nudge });
}
