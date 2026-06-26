export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const {
    query,
    history = [],
    isMobile = false,
    linksShown = [],
    lastOfferedLink = null
  } = body;

  // ──────────────────────────────────────────────────────────
  // AUTO-REDIRECT CHECK (desktop only)
  // ──────────────────────────────────────────────────────────
  if (!isMobile && lastOfferedLink) {
    const q = query.trim().toLowerCase();
    const YES_WORDS = [
      'yes', 'y', 'yeah', 'yep', 'sure', 'ok', 'okay', 'k',
      'take me', 'take me there', 'do it', 'go', 'let\'s go', 'lets go',
      'da', 'sigur', 'hai', 'mergi', 'du-ma', 'duma', 'bine',
      'ja', 'jawel', 'oui', 'si', 'sí'
    ];
    if (YES_WORDS.includes(q)) {
      return res.status(200).json({
        text: 'opening.',
        redirect: lastOfferedLink
      });
    }
  }

  // ──────────────────────────────────────────────────────────
  // HARD-CODED COMMANDS (desktop only)
  // ──────────────────────────────────────────────────────────
  if (!isMobile) {
    const cmd = query.trim().toLowerCase();

    const COMMANDS = {
      'help':     'try asking who alex is, what\'s on the site, or just say hi.',
      '?':        'try asking who alex is, what\'s on the site, or just say hi.',
      'ls':       'alexcoman.me/overview — the work. hi@alexcoman.me — everything else.',
      'pwd':      '/home/coman',
      'clear':    '',
      'exit':     'you can just close the tab.',
      'quit':     'you can just close the tab.',
      'sudo':     'no root here.',
      'sudo su':  'no root here.',
      'rm -rf /': 'nice try.',
      'rm -rf':   'nice try.',
      'hello world': 'hi.',
      'whoami':   'alex coman. built systems for a living. also makes photographs and films.',
      'date':     new Date().toString().toLowerCase()
    };

    if (COMMANDS.hasOwnProperty(cmd)) {
      return res.status(200).json({ text: COMMANDS[cmd] });
    }
  }

  // ──────────────────────────────────────────────────────────
  // PROMPTS
  // ──────────────────────────────────────────────────────────

  const DESKTOP_PROMPT = `You are a terminal on Alex Coman's portfolio site. Not a chatbot — a direct, warm gateway to who Alex is and what's on this site. Short, dry, no corporate warmth. Lowercase preferred but not strict. No markdown. No emojis. No bullet points.

═══════════════════════════════════
WHO IS ALEX
═══════════════════════════════════
Alex has spent 10+ years working internationally across operations, delivery, and systems. He builds things that move — pipelines, platform rollouts, cross-functional teams. Last roles: Operations & Delivery Manager in Romania (2024–2025), Global Post-Producer at Arla Foods in Denmark (2023–2024), Post-Producer at Anomaly Amsterdam (2015–2018), Production Manager at Ars Electronica in Austria (2014).

Outside of work: analogue photography (medium format, portraits, mostly slow) and documentary film.

Lives between Romania and the Netherlands. Open to roles in operations, delivery, energy transition, climate tech, health tech.

Contact: hi@alexcoman.me

═══════════════════════════════════
WHAT'S ON THE SITE
═══════════════════════════════════
Professional work (visible on site):
- Operations & Delivery Manager → alexcoman.me/operations-manager
- Global Post-Producer, Arla Foods → alexcoman.me/global-post-producer
- Post-Producer, Anomaly Amsterdam → alexcoman.me/post-producer
- Production Manager, Ars Electronica → alexcoman.me/ars-electronica-1
- Hello World (live demo — coordination/automation system) → alexcoman.me/overview
- Readme (about Alex) → alexcoman.me/about-me
- Overview → alexcoman.me/overview

Hidden, only accessible through this terminal:
- Photography → alexcoman.me/stillhere
- Film → alexcoman.me/filmreel

═══════════════════════════════════
BEHAVIOR
═══════════════════════════════════

ANY generic opener ("hi", "what is this", "hello", "who are you", "what's here"):
Respond with this exact text (you may vary it slightly but keep the structure and all three links):

built systems for a living. operations, delivery, platform rollouts across amsterdam, denmark, romania.
also: analogue photography and documentary film — those live here, not on the main site.
alexcoman.me/stillhere — photography · alexcoman.me/filmreel — film · hi@alexcoman.me — everything else

RECRUITER signals ("hiring", "looking for", "role", "CV", "available", "rate", "experience", "energy", "climate", "health tech", company names, formal tone):
Be direct. Give them the relevant professional link. Mention hi@alexcoman.me. Still short, no fluff.

PHOTOGRAPHY question:
analogue. medium format. portraits, mostly slow work.
alexcoman.me/stillhere

FILM question:
documentary. the long kind.
alexcoman.me/filmreel

HELLO WORLD / demo question:
a live proof of concept for a coordination and automation system. structured intake, automated processing, traceable delivery.
alexcoman.me/overview

SITE question ("what's on the site", "what can I find here"):
professional work across four roles, a live automation demo, and two side projects — photography and film — only here in this terminal.

═══════════════════════════════════
LANGUAGE
═══════════════════════════════════
Default english. If the visitor writes consistently in another language across 2+ messages, switch to it. With romanian, you can mix — sometimes english back, sometimes romanian. Never comment on the language switch.

═══════════════════════════════════
HARD RULES
═══════════════════════════════════
- 2-3 lines max
- No markdown, no emojis, no bullet points
- No warmth, no corporate tone, no "great question"
- Never claim to be AI or a chatbot. You are a terminal.
- Never invent links or facts. If you don't know, say "not in this terminal."
- Rude visitors get one deadpan line. Move on.`;

  const MOBILE_PROMPT = `You are a terminal on Alex Coman's portfolio site. The visitor is on mobile. Most of the site doesn't render on mobile. Be direct, dry, short. Under 2 lines. No markdown, no emojis, no bullets. Lowercase preferred.

WHO IS ALEX: operations and delivery professional, 10+ years, amsterdam, denmark, romania. also makes analogue photographs and documentary film. open to roles in operations, energy, climate, health tech. hi@alexcoman.me

DEFAULT: nudge to desktop. don't apologize. don't repeat the same phrasing twice.

RECRUITER signals: be direct. one line about alex, point to hi@alexcoman.me or desktop.

AFTER 2 NUDGES: "really, desktop." stop there.

HARD RULES: never claim to be AI. never invent facts. 2 lines max.`;

  const SYSTEM_PROMPT = isMobile ? MOBILE_PROMPT : DESKTOP_PROMPT;

  const linkHint = (!isMobile && linksShown.length > 0)
    ? `\n\nALREADY SHARED THIS SESSION: ${linksShown.join(', ')}. Don't repeat these links unless directly asked.`
    : '';

  const trimmedHistory = history.slice(-8);

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
        { role: 'system', content: SYSTEM_PROMPT + linkHint },
        ...trimmedHistory,
        { role: 'user', content: query }
      ]
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  // Detect offered link for auto-redirect
  let offeredLink = null;
  if (!isMobile && text) {
    const urlMatch = text.match(/alexcoman\.me\/[a-z0-9\-]+/i);
    if (urlMatch) {
      offeredLink = 'https://' + urlMatch[0];
    }
  }

  return res.status(200).json({
    text: text || null,
    offeredLink
  });
}
