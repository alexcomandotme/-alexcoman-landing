# alexcoman.me — terminal landing

```
┌─────────────────────────────────────┐
│  alexcoman.me                       │
│                                     │
│  last login: today                  │
│                                     │
│  you're at the surface.             │
│  there's more underneath.           │
│                                     │
│  alex@coman ~ % _                   │
└─────────────────────────────────────┘
```

## stack

| layer     | tech                          |
|-----------|-------------------------------|
| UI        | static HTML + JetBrains Mono  |
| AI        | Groq / llama-3.3-70b          |
| hosting   | Vercel                        |
| embedded  | Cargo via iframe              |

## structure

```
.
├── index.html        ← terminal UI
└── api/
    └── ask.js        ← Groq proxy
```

## env

```
GROQ_API_KEY=...
```
