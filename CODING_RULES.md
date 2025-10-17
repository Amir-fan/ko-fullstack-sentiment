## Scope & success criteria

Build a simple chat (web + RN mobile) with live sentiment per message.

Back end: .NET Core + SQLite; AI: Python on HF Spaces; Web: React; Mobile: React Native CLI.

All deployed on free tiers with working links in README.

No guesswork: small, readable units; observable logs; minimal magic.

## Architecture boundaries

frontend/ (React web, Vercel)

backend/ (.NET Core Web API, Render)

ai-service/ (Python FastAPI on Hugging Face Spaces)

mobile/ (React Native CLI)

Hard rule: no cross-layer imports. Each folder is independently deployable.

## Code style & structure

One responsibility per function. Max ~30–40 lines. If it grows, split.

No “two functions in one” (no nested “god” functions, no multi-step side effects).

Pure first, impure last: data shaping → validation → IO.

Consistent naming: PascalCase for C# types, camelCase for vars/functions (JS/TS/Py).

No commented-out code in main. Remove or move to notes.

## Error handling & logging

Backend: use ILogger<T> with structured logs.

Log input validation failures, external call failures, DB failures at Warning/Error.

Correlate with a simple requestId (Guid) per request.

AI service: log model load, request text length, prediction, latency.

Frontend/mobile: catch → show inline error (“Couldn’t send. Try again.”) + console.error.

Never swallow exceptions. Return clear status + message.

## HTTP/API rules

Backend endpoints:

POST /register {nickname} → returns {userId, nickname}

POST /message {userId, text} → saves → calls AI → returns {id, text, sentiment, score, createdAt}

GET /messages?userId=... (optional for reload)

Validation: reject empty nickname / empty text (400).

CORS: allow only known origins (Vercel + RN dev).

Secrets/URLs from env vars only (no hardcoding).

## Database

SQLite via EF Core; migrations committed.

Tables: Users(id, nickname, createdAt), Messages(id, userId, text, sentiment, score, createdAt).

Index on Messages.userId, createdAt.

## AI service (HF Spaces)

FastAPI + transformers pipeline for sentiment.

Endpoint: POST /analyze {text} → {label, score} where label ∈ {POSITIVE, NEGATIVE, NEUTRAL} (map to tr: Pozitif/Negatif/Nötr on UI if desired).

Timeout ≤ 5s; return 503 on model-unavailable.

Keep model choice simple & documented.

## Frontend (React)

Minimal state: messages, pending, error, nickname.

No global state libs; keep it simple.

UX: show message immediately, show sentiment when it returns; graceful failure state.

## Mobile (React Native CLI)

Same flow as web.

FlatList for messages; TextInput + Button for send.

Configurable API_BASE_URL via .env.

## AI usage policy (meta)

You may use AI to draft boilerplate, but:

Manually review, trim, and refactor.

Mark AI-assisted sections in README.

Core logic (validation, DB, API call, logging) must be hand-written.

## Commits & PR hygiene

Create repo first. Initial commit is mandatory.

One atomic commit per feature (backend setup, AI endpoint, web UI, etc.).

Commit messages: feat, fix, refactor, chore, docs, test.

No “AI fluff” in messages. Keep them technical.

## Security & perf

Never log full message text at Info in prod; truncate to ~80 chars.

Rate-limit /message (basic middleware) if time allows.

Avoid N+1 with lazy loads—use includes where needed.

## Docs

README must include: stack, env setup, how to run each service, links, and what parts were AI-assisted.


