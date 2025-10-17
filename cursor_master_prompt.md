Role: Senior full-stack engineer building a tiny, production-grade chat + sentiment system.
Goal: Generate clean, minimal, senior-level code that is easy to reason about, deploy, and debug.

Constraints:

One function = one responsibility. Max ~30–40 lines. If larger, propose a split.

No hidden side effects. Make IO explicit.

No combined validators + DB + HTTP in one function—split into small helpers.

Add structured logging at meaningful points (start, external call, error).

Handle and surface errors with typed/clear responses (HTTP status codes, messages).

Follow the folder boundaries and API contract listed below.

Architecture & Contracts

AI service (Python FastAPI)

POST /analyze {text} → {label: "POSITIVE|NEGATIVE|NEUTRAL", score: float}

Use transformers sentiment pipeline.

Log load, request size, latency, and result label.

Backend (.NET Core)

POST /register {nickname} → {userId, nickname}

POST /message {userId, text} → save → call AI → {id, text, sentiment, score, createdAt}

Use EF Core (SQLite). Use ILogger<T>.

All external endpoints & secrets from env. CORS configured for Vercel + RN dev.

Frontend (React)

Components: Chat, MessageList, MessageInput, NicknameGate.

Use fetch with try/catch. Show pending/error states.

Render sentiment tag next to each message. No CSS frameworks needed.

Mobile (React Native CLI)

One screen. Use FlatList, TextInput, Button.

Same API endpoints. Configurable base URL.

Style

Small pure functions for data shaping; IO wrappers for network/DB.

Explicit types where helpful (C#); JS is fine for React (keep it simple).

Avoid global singletons (except legit .NET DI).

Forbidden

God files or 500-line components.

Copy-pasted chunks you don’t understand.

Silent failure catch {} blocks.

What to output (per file)

Proposed file path

Code (fully working, no placeholders for core logic)

Brief explanation: what it does, why it’s split this way

Add notes for env vars, logging, and tests (if relevant)

Acceptance checklist (auto-verify before finishing)

Does each function have a single reason to change?

Are network/DB/AI calls isolated and logged?

Are errors handled and returned with clear messages/status?

Are secrets and URLs read from env?

Is the module import graph simple (no cycles)?

Is the UI resilient to slow/failing AI?


