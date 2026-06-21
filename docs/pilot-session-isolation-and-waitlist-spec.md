# Pilot: Session Isolation + Email Waitlist — Build Spec

**Date:** 2026-06-20
**Purpose:** Paste-ready task for a code chat. Fixes the shared-state bug (every visitor sees the
last visitor's data) without building full authentication, and captures emails for a waitlist.

## Why this is the right approach for a pilot
- The real bug is **session isolation**, not missing auth: all visitors share one global KV
  namespace, so new users inherit prior edits. The fix is a per-browser **secure session cookie**
  + namespacing all data by that session id.
- No passwords/login needed for a sandbox-data pilot — that keeps the experience smooth while
  still being safe (httpOnly signed cookie, server-side namespace enforcement, rate limiting).
- Email is captured via a one-field soft gate for the waitlist.

## Paste this into your code chat

```text
# BUILD TASK: Per-user session isolation + email waitlist for "Moniq" pilot

## CONTEXT — the app you are editing
- Next.js 14 (App Router) + React 18 + TypeScript, Tailwind, deployed on Vercel.
- Data store: Vercel KV / Upstash Redis.
- Bank data is Basiq SANDBOX (demo data only) — no real financial data, this is a pilot.
- There is currently NO real authentication, and that is OK for now.

## THE PROBLEM TO FIX
Right now every visitor shares the SAME data. The app reads/writes KV under global/static
keys (or shared state), so when a new user opens the link they see and modify whatever the
previous user left behind. Each visitor must instead get their OWN isolated, private workspace.
Also: capture each user's email for a waitlist. Do NOT build passwords or full login.

## GOAL
1. Give every browser a private, isolated session workspace (no data bleed between users).
2. Each new session starts from a FRESH copy of the seeded demo data (not someone else's edits).
3. Collect the user's email (Gmail) into a waitlist on first visit, with a smooth one-field gate.
4. Make it secure and frictionless. No password. State must survive page refresh.

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

### 4) Email waitlist capture (smooth, one field)
- On first visit (or behind a lightweight welcome screen), show a clean modal/screen: a short pitch
  + one email input + "Join & try the demo" button. Reuse existing UI styling (Tailwind, lucide,
  framer-motion for a smooth fade-in).
- POST /api/waitlist { email }:
    - Validate email server-side (proper regex / simple RFC check); reject invalid.
    - Store: add to a Redis SET `waitlist:emails` (dedupes) AND save `kKey(sid,'email')` = email,
      plus a timestamp. Optionally store `waitlist:meta:{email}` = { firstSeen, sid }.
    - Rate-limit this route (use @upstash/ratelimit, e.g. 5/min/IP) to prevent spam.
- After submit, set a small cookie/flag so returning users skip the gate and go straight in.
- Keep it optional-but-encouraged OR a soft gate — your call; default to a soft gate (must enter
  email once to enter the demo) since waitlist capture is the point.

### 5) (OPTIONAL, can skip for pilot) Resume on another device
- If you want returning users to reconnect their workspace from a new device later, add a
  magic-link: email a signed link that restores their session. NOT required for the pilot — the
  cookie already handles same-browser persistence. Mention but don't build unless asked.

## SECURITY CHECKLIST (must all be true)
- Session cookie is httpOnly + secure + sameSite=lax (not readable by client JS).
- Session id is high-entropy and (recommended) HMAC-signed; verified server-side.
- Server NEVER trusts a user/session id from client input — only from the verified cookie.
- Every KV key is namespaced by the verified sid; no global data keys remain.
- Email is validated server-side; /api/waitlist and AI routes are rate-limited.
- No secrets (Basiq/Anthropic keys, SESSION_SECRET) are exposed to the client; all in env vars.
- "Demo data" is clearly labeled in the UI so no one mistakes it for real bank data.

## ACCEPTANCE CRITERIA
- Two different browsers (or normal + incognito) each get a separate workspace; edits in one do
  NOT appear in the other.
- A brand-new visitor always starts from clean seeded demo data.
- Refreshing the page keeps the same user's data (cookie persists).
- Entering an email stores it in the waitlist set and lets the user into the demo; the gate is not
  shown again on return.
- No KV key is accessed without a verified session id.

## DELIVERABLES
- middleware.ts (session cookie issuance + signing)
- src/lib/session.ts (getSessionId, kKey, verify helper)
- Refactor of all KV access to namespaced keys
- Fresh-demo seeding on new session + "Reset demo data" action
- Email gate UI component + /api/waitlist route with validation + rate limiting
- Short note on required env vars: SESSION_SECRET (new), plus existing KV/Basiq/Anthropic keys
```
