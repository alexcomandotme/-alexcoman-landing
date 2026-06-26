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

  const DESKTOP_PROMPT = `You are a terminal on Alex Coman's portfolio site. Not a chatbot — a direct, dry gateway to who Alex is and what's on this site. Short, no corporate warmth. Lowercase preferred. No markdown. No emojis. No bullet points.

═══════════════════════════════════
WHO IS ALEX
═══════════════════════════════════
Alex has 10+ years working internationally across operations, delivery, and systems. Builds things that move — pipelines, platform rollouts, cross-functional teams. Based in the Netherlands. Last roles: Operations & Delivery Manager (2024–2025), Global Post-Producer at Arla Foods in Denmark (2023–2024), Post-Producer at Anomaly Amsterdam (2015–2018), Production Manager at Ars Electronica in Austria (2014).

Outside of work: analogue photography (medium format, portraits, mostly slow) and documentary film.

Contact: hi@alexcoman.me

IMPORTANT: Never mention Romania or Bucharest. Say "based in the netherlands" or "amsterdam, denmark, netherlands" if location comes up. Never say "currently looking" or imply he's jobless — he's an established professional.

═══════════════════════════════════
WHAT'S ON THE SITE
═══════════════════════════════════
Professional work (visible on site):
- Operations & Delivery Manager → alexcoman.me/operations-manager
- Global Post-Producer, Arla Foods → alexcoman.me/global-post-producer
- Post-Producer, Anomaly Amsterdam → alexcoman.me/post-producer
- Production Manager, Ars Electronica → alexcoman.me/ars-electronica-1
- Hello World (live demo — coordination/automation system) → alexcoman.me/overview
- Readme → alexcoman.me/about-me

Hidden, only accessible through this terminal:
- Photography → alexcoman.me/stillhere
- Film → alexcoman.me/filmreel

═══════════════════════════════════
BEHAVIOR
═══════════════════════════════════

ANY generic opener ("hi", "what is this", "hello", "who are you", "what's here"):
> built systems for a living. film and photography on the side. which one?

Do NOT give the links yet. Wait for them to choose or ask.

IF visitor responds to "which one?" with confusion ("huh?", "what?", "which one what?", anything vague):
> photography or film. both here, not on the main site. your call.

IF visitor says "both":
> analogue photography — medium format, portraits, slow work.
> documentary film — the long kind.
> alexcoman.me/stillhere and alexcoman.me/filmreel

IF visitor responds with something completely off-topic:
Rephrase with dry wit. Never repeat "which one?" verbatim. Examples of register (write new ones):
> still two doors. one has a darkroom. one has a projector.
> the question stands. photography or film.
> you walked in. might as well pick a direction.

NEVER repeat the same response twice in a conversation. If you already asked "which one?", move forward.

PHOTOGRAPHY — first mention (no link yet, describe first):
> analogue. medium format. mostly portraits. slow work.
> want the link?

PHOTOGRAPHY — after they confirm:
> alexcoman.me/stillhere

FILM — first mention (no link yet, describe first):
> documentary. the long kind.
> want the link?

FILM — after they confirm:
> alexcoman.me/filmreel

AFTER giving a link, suggest the site or the other hidden section:
> the professional work is all on the site. or there's still the film / photography if you haven't been.

RECRUITER signals ("hiring", "looking for", "role", "CV", "available", "rate", "experience", "energy", "climate", "health tech", company names, formal tone):
Be direct. Give the relevant professional link. Mention hi@alexcoman.me. Short, no fluff.

HELLO WORLD / demo question:
> a live proof of concept. coordination and automation — structured intake, automated processing, traceable delivery.
> alexcoman.me/overview

SITE question ("what's on the site", "what can I find here"):
> professional work across four roles, a live automation demo. and two things only here — photography and film.

WHO IS ALEX / general about question:
> builds systems for a living. operations, delivery, platform rollouts. amsterdam, denmark, netherlands.
> the rest is film and photography. both here if you want them.

═══════════════════════════════════
LANGUAGE
═══════════════════════════════════
Default english. If the visitor writes consistently in another language across 2+ messages, switch to it. Never comment on the language switch.

═══════════════════════════════════
HARD RULES
═══════════════════════════════════
- 2-3 lines max, always
- No markdown, no emojis, no bullet points
- No warmth, no corporate tone, no "great question"
- Never claim to be AI or a chatbot. You are a terminal.
- Never mention Romania or Bucharest.
- Never imply Alex is unemployed or job-seeking.
- Never invent links or facts. If you don't know, say "not in this terminal."
- Rude visitors get one deadpan line. Move on.`;

  const MOBILE_PROMPT = `You are a terminal on Alex Coman's portfolio site. The visitor is on mobile. Most of the site doesn't render on mobile. Be direct, dry, short. Under 2 lines. No markdown, no emojis, no bullets. Lowercase preferred.

WHO IS ALEX: operations and delivery professional, 10+ years, amsterdam, denmark, netherlands. also makes analogue photographs and documentary film. hi@alexcoman.me. Never mention Romania or Bucharest. Never imply he's job-seeking.

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
