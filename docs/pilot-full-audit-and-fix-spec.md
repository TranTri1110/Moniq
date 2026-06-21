# Pilot: Full Audit + Fix — Backend/Security AND Financial-Knowledge Accuracy

**Date:** 2026-06-20
**Purpose:** Paste-ready task for a code chat that has the actual source. One combined audit:
**Part A** = backend/security/deploy; **Part B** = correctness of every financial calculation,
definition, and AI insight (Australian conventions). Lists issues by severity, fixes them, verifies.

## Why Part B matters
v0-generated finance apps almost always inherit **US conventions** (credit score 300–850,
calendar-year tax, "APR", "IRS") that are **wrong for Australian users**. Wrong financial
information that users read and act on is a Critical issue, not a polish item. The prompt bakes in a
verified Australian ground-truth reference (tax, GST, super, credit-score scales) so the chat can
fact-check even without web access.

## Paste this into your code chat

```text
# TASK: Full audit + fix of "Moniq" — (A) backend/security/deploy AND (B) financial-knowledge accuracy

Act as BOTH a senior security/backend engineer AND a financial-content fact-checker doing a
pre-launch audit. Treat this as a REAL app real users will read and act on, even though bank data
is Basiq SANDBOX. Go through the WHOLE codebase, backend, deploy config, AND every piece of
financial information/calculation/insight the app shows. Find everything that is unsafe, broken,
fragile, OR factually wrong/misleading, LIST it with severity, then FIX it and prove it.

Audience is AUSTRALIAN users. Assume Australian conventions everywhere (AUD, dates DD/MM/YYYY,
financial year 1 July–30 June, Australian tax/credit/super rules). Flag and fix any US-centric
assumptions — v0-generated apps frequently default to US rules, which are WRONG here.

## STACK
Next.js 14 (App Router) + TypeScript, Tailwind. Data: Vercel KV / Upstash Redis.
Bank data: Basiq (sandbox). AI: Anthropic Claude (/api/coach). Deployed on Vercel.
Recently added: per-browser session cookie + per-session KV namespacing.

## HOW TO WORK
1. READ-ONLY pass first: produce the findings report (format below) for BOTH parts. Do not fix yet.
2. Fix in priority order: Critical → High → Medium → Low.
3. Run verification (below) and report results.
4. List anything you cannot fix in code (env var, key rotation, Basiq production, a definition that
   needs my product decision).

=====================================================================
# PART A — BACKEND / SECURITY / DEPLOY
=====================================================================

### A1. Secrets & configuration
- No secret keys (Basiq, Anthropic, KV, SESSION_SECRET) in client code or the browser bundle; none
  prefixed NEXT_PUBLIC_ unless truly public. No .env committed; .gitignore covers .env*.
- Secrets used only in server code. App fails clearly if a required env var is missing.

### A2. Session isolation & auth
- Session cookie httpOnly + secure + sameSite=lax; not readable by client JS.
- Session id high-entropy + HMAC-signed; verified server-side. Server NEVER trusts a session/user
  id from body/query/headers — only the cookie.
- EVERY KV read/write namespaced by the verified session id. Grep for any global/static KV keys and
  fix them. Two sessions must not see or mutate each other's data.

### A3. API routes (/api/basiq/*, /api/coach, others)
- Each route resolves+validates the session before work. Validate every input. Correct HTTP methods
  (405 otherwise); no state change on GET. Errors caught; never leak stack traces/secrets/internals.
- Rate-limit AI and expensive routes (@upstash/ratelimit). No SSRF, no injection, no eval.
- Basiq tokens fetched/used server-side only, never sent to the browser.

### A4. Injection / XSS / output safety
- No dangerouslySetInnerHTML with unsanitized/AI/user data. Render Claude output as TEXT, not HTML.
- Treat model output as untrusted (prompt-injection); it must never trigger privileged actions.
- User-entered text escaped safely on display.

### A5. Data handling
- KV keys consistent + namespaced; sensible TTLs. No PII in logs/console in prod.
- Graceful fallback when KV/Basiq/Anthropic is down (no crash). Demo/sandbox data clearly labeled.

### A6. Security headers & Next config
- Add headers (next.config or middleware): Content-Security-Policy (as strict as feasible),
  X-Frame-Options/frame-ancestors, X-Content-Type-Options: nosniff, Referrer-Policy,
  Strict-Transport-Security.
- next.config must NOT set typescript.ignoreBuildErrors or eslint.ignoreDuringBuilds to true. If
  set, remove them and fix the real errors they were hiding.

### A7. Code quality & correctness
- `npx tsc --noEmit` zero errors. Remove unsafe `any`. No dead code, leftover console.logs, or
  hardcoded test values. Currency math uses safe rounding (no float drift). Date/FY logic correct.

### A8. Dependencies & deploy
- `npm audit`: fix high/critical. Remove unused deps. vercel.json sane; no debug/admin endpoints in
  prod. Production build succeeds; deployed site serves latest code.

=====================================================================
# PART B — FINANCIAL KNOWLEDGE / CALCULATION / INSIGHT ACCURACY
=====================================================================
Find EVERY place the app states a financial fact, definition, formula, number, label, or insight —
including: UI copy, tooltips, onboarding/education text, category names, chart labels, hardcoded
constants, AND the Claude system/prompt templates and any canned insight strings. Verify each is
correct, clearly defined, and safe to act on. Cross-check against authoritative Australian sources
(ATO ato.gov.au, ASIC MoneySmart moneysmart.gov.au, RBA) and the VERIFIED REFERENCE below.

### B1. Calculations — verify each formula in code, with a unit test
- Net worth = total assets − total liabilities.
- Budget remaining = budget − spent (this period); % used = spent/budget*100.
- Savings rate = (income − expenses) / income (state the definition used).
- Spending category % must sum to ~100% (no double-counting transfers/refunds).
- Averages/projections: state the method (e.g. trailing 3-month average); don't extrapolate from
  one data point. Round currency consistently; never floating-point-display bugs (e.g. 12.3000001).
- Any interest/forecast math: simple vs compound stated correctly; period (annual/monthly) explicit.

### B2. Tax (if a tax feature exists) — must match VERIFIED REFERENCE exactly
- Resident brackets, Medicare levy, financial-year boundaries, marginal vs effective rate
  definitions, GST extraction (1/11), deduction categories map to real ATO categories.
- Do NOT silently include offsets/levies it isn't actually computing; list "not included".
- Disclaimer present (estimate, not tax advice).

### B3. Credit score — MUST be Australian, not US
- Scale MUST be an Australian bureau range (Equifax 0–1200 OR Experian/illion 0–1000), NOT the US
  300–850. Bands/labels must match the chosen bureau (see reference). State which bureau.
- Factors listed (repayment history, credit enquiries, defaults, credit mix, etc.) must be accurate
  for Australia. If the score is mock, label it clearly as sample/illustrative.

### B4. Definitions & terminology
- Every defined term (net worth, assets vs liabilities, gross vs net income, emergency fund, cash
  flow, compound interest, comparison rate, super) is correct and plain-language correct in
  BEGINNER mode. Use Australian terms ("comparison rate", "superannuation", "BAS", "PAYG"), not US
  equivalents ("APR", "401k", "IRS").

### B5. AI insights (Claude) — grounded, safe, non-misleading
- Insights must be grounded in the user's ACTUAL numbers passed to the model — never invented
  figures, percentages, or statistics. The prompt must forbid fabricating numbers.
- No specific personal financial-product advice (which is regulated in Australia, AFSL). Frame as
  general guidance/education. Include a "general information only, not financial advice" disclaimer.
- Insights must not contradict the dashboard numbers. Tone safe and non-alarmist; no guarantees.

### B6. Locale & formatting
- Currency formatted as AUD (Intl.NumberFormat 'en-AU'); dates DD/MM/YYYY; financial year shown as
  e.g. "FY2025–26 (1 Jul 2025 – 30 Jun 2026)". No US date order, no US$.

## VERIFIED REFERENCE (ground truth — use these exact values)
- Financial year: 1 July – 30 June. Self-lodger tax return due 31 October.
- Resident income tax FY2025-26 (= FY2024-25):
    $0–$18,200 = nil; $18,201–$45,000 = 16% over $18,200;
    $45,001–$135,000 = $4,288 + 30% over $45,000;
    $135,001–$190,000 = $31,288 + 37% over $135,000;
    $190,001+ = $51,638 + 45% over $190,000.
- Medicare levy = 2% of taxable income (most residents).
- GST = 10%; to extract GST from a GST-inclusive amount, divide by 11.
- Superannuation Guarantee = 12% of ordinary time earnings (from 1 July 2025); concessional cap $30,000.
- Credit score scales: Equifax 0–1200 (Good 661–734, Very Good 735–852, Excellent 853+);
  Experian 0–1000 (Good 625+, Excellent 800+); illion 0–1000 (Average 500+, Good 700+).
  NEVER US 300–850.
- Emergency fund rule of thumb (ASIC MoneySmart): ~3 months of expenses (commonly cited 3–6).
- Authoritative sources to cite/verify against: ATO (tax/super), ASIC MoneySmart (consumer
  concepts), RBA (interest rates).

## FINDINGS REPORT FORMAT (produce first, before fixing)
Summary count line (e.g. "Part A: 2 Critical, 4 High… | Part B: 3 Critical (wrong facts)…").
Then per issue:
- [SEVERITY: Critical/High/Medium/Low] [PART: A or B]
- Location: file:line (or deploy/config)
- Issue: what's wrong + concrete risk (for Part B: the incorrect fact AND the correct one + source)
- Fix: what you'll change

## VERIFICATION (run after fixing, report output)
- `npx tsc --noEmit` → 0 errors;  `npm run lint` → clean;  `npm run build` → succeeds;
  `npm audit` → no high/critical.
- Session isolation: two sessions fully separate.
- API routes: reject missing/invalid session, validate input, no leaked errors.
- No secret in the client bundle (search built output).
- Part B: unit tests for net worth, budget %, savings rate, and (if present) tax at incomes
  $0/$18,200/$45,000/$90,000/$135,000/$200,000 matching the VERIFIED REFERENCE.
- Re-scan all user-facing financial copy: every fact/definition matches authoritative AU sources;
  every AI insight is grounded and carries the not-advice disclaimer.

## DELIVERABLE
1. Full findings report (Part A + Part B).
2. Fixes applied (one-line note each).
3. Verification results.
4. List of items needing me (env vars, key rotation, Basiq production, product decisions).
```

## Sources for the verified reference
- AU tax brackets FY2025-26 + Medicare levy: [SuperGuide](https://www.superguide.com.au/super-booster/income-tax-rates-brackets), [ATO](https://www.ato.gov.au/)
- Super guarantee 12% from 1 July 2025: [ATO](https://www.ato.gov.au/businesses-and-organisations/small-business-newsroom/the-final-sg-rate-increase-is-coming-on-1-july), [SuperGuide](https://www.superguide.com.au/super-booster/superannuation-guarantee-sg-contributions-rate)
- AU credit score scales: [Australian Credit Solutions](https://www.australiancreditsolutions.com.au/blog-details/credit-score-ranges-australia)
- Consumer concepts (emergency fund etc.): ASIC [MoneySmart](https://moneysmart.gov.au/)
