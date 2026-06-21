# Pilot: Full Production-Readiness Audit + Fix — Build Spec

**Date:** 2026-06-20
**Purpose:** Paste-ready task for a code chat that has the actual source. Runs a full
security + backend + deploy audit of the Moniq prototype, lists every issue by severity,
fixes them, and verifies. Use this before sharing the pilot widely.

## How to use
Paste the block below into the code chat that holds the Moniq source. It will first produce a
findings report, then fix in priority order, then run verification. Anything it can't fix in code
(env vars, key rotation, Basiq production) it will list for you to action.

## Paste this into your code chat

```text
# TASK: Full production-readiness audit + fix of the "Moniq" prototype

Act as a senior security + backend engineer doing a pre-launch audit. Treat this as a REAL app
that real users will use, even though bank data is Basiq SANDBOX. Go through the WHOLE codebase,
the backend, and the deploy configuration. Find everything unsafe, broken, fragile, or sloppy,
LIST it with severity, then FIX it and prove the fixes work. Do not assume anything is fine
because it "looks done" — verify it in the code.

## STACK (for reference)
Next.js 14 (App Router) + TypeScript, Tailwind. Data: Vercel KV / Upstash Redis.
Bank data: Basiq (sandbox). AI: Anthropic Claude (/api/coach). Deployed on Vercel.
Recently added: per-browser session cookie + per-session KV namespacing.

## HOW TO WORK
1. First do a READ-ONLY pass and produce a findings report (format below). Do not fix yet.
2. Then fix issues in priority order: Critical → High → Medium → Low.
3. After fixing, RUN verification (see "Verification") and report results.
4. Do not introduce new dependencies unless necessary; if you do, justify it.

## AUDIT CHECKLIST — go through every item explicitly

### A. Secrets & configuration (highest priority)
- No secret keys (Basiq, Anthropic, KV, SESSION_SECRET) appear in client-side code or the browser
  bundle. Confirm none are prefixed NEXT_PUBLIC_ unless truly public.
- No .env / credentials committed to git. .gitignore covers .env*.
- All secrets read only in server code (route handlers, server components, middleware).
- Required env vars are documented; app fails clearly if one is missing (no silent undefined).

### B. Session isolation & auth (verify the recent work)
- Session cookie is httpOnly + secure + sameSite=lax; not readable by client JS.
- Session id is high-entropy and HMAC-signed; signature verified server-side before use.
- The server NEVER trusts a session/user id from request body, query, or headers — only the cookie.
- EVERY KV read/write is namespaced by the verified session id. Grep for any global/static KV keys
  that bypass the namespace and fix them. No endpoint can read another session's data.
- Test the isolation: two sessions cannot see or mutate each other's data.

### C. API routes (/api/basiq/*, /api/coach, and any others)
- Every route resolves and validates the session server-side before doing work.
- Input validation on every request body/param (reject malformed; never trust client input).
- Correct HTTP methods; reject others (405). No state-changing logic on GET.
- Errors are caught; responses NEVER leak stack traces, secrets, or internal details to the client.
- Rate limiting on AI route and any expensive/abusable route (@upstash/ratelimit).
- No SSRF (no fetching user-supplied URLs), no command/code injection, no unsafe eval.
- Basiq access tokens are fetched and used server-side only, never sent to the browser.

### D. Injection / XSS / output safety
- No dangerouslySetInnerHTML with unsanitized data (especially AI output or anything user-derived).
- AI (Claude) responses are rendered as text, not HTML; consider prompt-injection (treat model
  output as untrusted; never let it trigger privileged actions).
- Any user-entered text (notes, categories) is escaped/handled safely when displayed.

### E. Data handling
- KV keys are consistent and namespaced; set sensible TTLs where appropriate.
- No PII (emails, transaction data) written to logs or console in production.
- Demo/sandbox data is clearly labeled in the UI; no real-bank claims.
- Graceful handling when KV / Basiq / Anthropic is unavailable (no crash, friendly fallback).

### F. Security headers & Next config
- Add security headers (via next.config or middleware): Content-Security-Policy (as strict as
  feasible), X-Frame-Options/ frame-ancestors, X-Content-Type-Options: nosniff,
  Referrer-Policy, Strict-Transport-Security.
- next.config does NOT ignore type or eslint errors on build (no
  typescript.ignoreBuildErrors / eslint.ignoreDuringBuilds set to true). If set, remove and fix
  the underlying errors.

### G. Code quality & correctness
- `npx tsc --noEmit` passes with zero errors. Remove unsafe `any` that hide bugs.
- `npm run lint` passes (fix real issues, don't just silence).
- No dead code, no leftover console.logs, no commented-out blocks, no hardcoded test values.
- Money math uses safe number handling (no floating-point surprises on currency).
- Dates/financial-year logic correct (date-fns); timezone-safe.

### H. Functional pass (treat as a real user)
- Every page/section loads without console errors.
- Every button/action works and has loading + error + empty states (no dead buttons, no infinite
  spinners, no unhandled promise rejections).
- Edge cases: empty data, very large numbers, rapid clicks, refresh mid-action, expired session.

### I. Dependencies & deploy
- `npm audit` — report and fix high/critical vulnerabilities (update or replace).
- No unused dependencies.
- Confirm vercel.json / project settings are sane; no debug or admin endpoints exposed in prod.
- Confirm the production build succeeds and the deployed site serves the latest code.

## FINDINGS REPORT FORMAT (produce this first, before fixing)
For each issue:
- [SEVERITY: Critical/High/Medium/Low]
- Location: file:line (or "deploy/config")
- Issue: what's wrong and the concrete risk
- Fix: what you will change

Group by severity. Give a one-line summary count at the top
(e.g. "3 Critical, 5 High, 8 Medium, 4 Low").

## VERIFICATION (run after fixing, report output)
- `npx tsc --noEmit` → 0 errors
- `npm run lint` → clean
- `npm run build` → succeeds
- `npm audit` → no high/critical
- Session isolation manual test: two sessions are fully separate
- Each API route: rejects missing/invalid session, validates input, handles errors without leaking
- Confirm no secret appears in the client bundle (search the built output)

## DELIVERABLE
1. The full findings report.
2. The fixes applied (with a short note per fix).
3. Verification results showing everything passes.
4. A short list of anything that CANNOT be fixed in code and needs me to act (e.g. set an env var
   in Vercel, rotate a leaked key, apply for Basiq production).
```
