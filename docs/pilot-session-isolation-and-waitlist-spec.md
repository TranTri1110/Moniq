# Pilot: Session Isolation — Build Spec

**Date:** 2026-06-20
**Purpose:** Paste-ready task for a code chat. Fixes the shared-state bug (every visitor sees the
last visitor's data) without building password authentication. Email/waitlist capture already
exists and is intentionally out of scope here.

## Why this is the right approach for a pilot
- The real bug is **session isolation**, not missing auth: all visitors share one global KV
  namespace, so new users inherit prior edits. The fix is a per-browser **secure session cookie**
  + namespacing all data by that session id.
- No passwords/login needed for a sandbox-data pilot — keeps the experience smooth while staying
  safe (httpOnly signed cookie, server-side namespace enforcement, rate limiting).

## Paste this into your code chat

```text
# BUILD TASK: Per-user session isolation for "Moniq" pilot

## CONTEXT — the app you are editing
- Next.js 14 (App Router) + React 18 + TypeScript, Tailwind, deployed on Vercel.
- Data store: Vercel KV / Upstash Redis.
- Bank data is Basiq SANDBOX (demo data only) — no real financial data, this is a pilot.
- Email capture / waitlist is ALREADY built — do NOT add or touch it.
- There is NO password authentication, and that is fine for this pilot.

## THE PROBLEM TO FIX
Every visitor currently shares the SAME data. The app reads/writes KV under global/static keys
(or shared state), so when a new user opens the link they see and modify whatever the previous
user left behind. Each visitor must instead get their OWN isolated, private workspace.

## GOAL
1. Give every browser a private, isolated session workspace (no data bleed between users).
2. Each new session starts from a FRESH copy of the seeded demo data (not someone else's edits).
3. Keep it secure and frictionless. No password. State must survive page refresh.

## SOLUTION DESIGN

### 1) Anonymous session via secure cookie (this is the core fix)
- Add Next.js middleware (middleware.ts). On every request, if there is no `moniq_sid` cookie,
  generate a high-entropy id (crypto.randomUUID() or 32 random bytes hex) and set it as a cookie:
    - httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*90 (90 days).
- HARDENING (recommended): HMAC-sign the id with a server secret (env: SESSION_SECRET) and store
  value as `${id}.${hmac}`; verify the signature server-side before trusting it. This stops anyone
  forging another user's session id.
- The session id is read ONLY from this cookie on the server. NEVER accept a session/user id from
  the request body or query string (that would let users read each other's data).

### 2) Namespace ALL data by session id
- Create a helper, e.g. src/lib/session.ts: `getSessionId()` (reads + verifies the cookie in a
  server context) and `kKey(sid, ...parts)` => `sess:${sid}:${parts.join(':')}`.
- Refactor EVERY KV read/write (transactions, accounts, budgets, goals, tax, AI state, etc.) to use
  `kKey(sid, ...)` instead of any global/static key. No data may be stored under a non-namespaced key.
- All API routes (/api/basiq/*, /api/coach, any others) must resolve the sid server-side and only
  touch that session's namespace.

### 3) Fresh demo data per session
- On first access of a new session (no data yet under its namespace), seed a fresh COPY of the
  sandbox/demo dataset into that session's keys (from the existing mock/sandbox source).
- Result: a new visitor always starts clean, never inheriting another user's edits.
- Add a "Reset demo data" button that clears the session namespace and re-seeds.

## SECURITY CHECKLIST (must all be true)
- Session cookie is httpOnly + secure + sameSite=lax (not readable by client JS).
- Session id is high-entropy and (recommended) HMAC-signed; verified server-side.
- Server NEVER trusts a user/session id from client input — only from the verified cookie.
- Every KV key is namespaced by the verified sid; no global data keys remain.
- AI routes (/api/coach, etc.) are rate-limited (use @upstash/ratelimit).
- No secrets (Basiq/Anthropic keys, SESSION_SECRET) are exposed to the client; all in env vars.
- "Demo data" is clearly labeled in the UI so no one mistakes it for real bank data.

## ACCEPTANCE CRITERIA
- Two different browsers (or normal + incognito) each get a separate workspace; edits in one do
  NOT appear in the other.
- A brand-new visitor always starts from clean seeded demo data.
- Refreshing the page keeps the same user's data (cookie persists).
- No KV key is accessed without a verified session id.

## DELIVERABLES
- middleware.ts (session cookie issuance + signing)
- src/lib/session.ts (getSessionId, kKey, verify helper)
- Refactor of all KV access to namespaced keys
- Fresh-demo seeding on new session + "Reset demo data" action
- Note required env var: SESSION_SECRET (new), plus existing KV/Basiq/Anthropic keys
```

## Note on tying sessions to the existing email
Email capture already exists, so if you want a returning user (same browser) to keep their data,
the cookie already handles it. If later you want to reconnect a user's workspace to their email
across devices, link `sess:{sid}:email` to the stored email — but that is NOT needed for the pilot.
