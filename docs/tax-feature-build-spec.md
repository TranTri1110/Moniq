# Tax Companion — Feature Design & Build Spec (Australia-first)

**Date:** 2026-06-20
**Purpose:** Design rationale + a paste-ready build spec for adding a Tax feature to Moniq. The spec in §2 is self-contained — paste it into a code-generation chat (v0/Claude) to build the feature.

---

## 1. Why this design (competitor research)

| App | What it does | What Moniq copies |
|-----|--------------|-------------------|
| **Keeper Tax** (US) | Links bank/cards via Plaid, AI auto-monitors statements to flag tax-deductible expenses, predicts the tax bill year-round, 300+ checks | AI deduction detection from the transaction feed; year-round running estimate (no tax-time surprise) |
| **FlyFin** (US) | ML scans transactions, categorizes into deduction categories, **swipe** right/left to accept/reject, CPA review | Swipe-to-confirm review queue; map to ATO categories; conservative AI with confidence + "needs evidence" |
| **Hnry** (AU) | Auto-calculates income tax + GST + Medicare every time you're paid; sole-trader focus; ATO-supported | AU income tax + Medicare levy engine; optional GST module for sole traders |
| **ATO myDeductions** (AU) | Official tool to record work expenses + income, upload to return at tax time | Income tracking + an exportable tax-time summary to hand to an accountant / use with myTax |
| **TaxTank** (AU) | Vehicle logbook, home-office claims | Partial-deductibility handling (car, phone/internet, WFH are only partly deductible) |

**Key insight:** Moniq already has the two hard ingredients these apps are built on — a **Basiq transaction feed** and a **Claude AI endpoint**. The tax feature is mostly *applying Claude to data you already hold*, plus a correct AU tax-math module. That's a high value-to-effort feature and reinforces Moniq's "AI-powered" positioning.

**Why Australia-first:** Basiq is AU/NZ-only and the team is Melbourne-based. Tax logic is inherently region-specific, so a generic tax feature would be useless. The spec keeps brackets/categories in a per-financial-year config object so other regions can be added later.

**Compliance guardrail (non-negotiable):** this is an **estimator/organiser, not tax advice or lodgement.** Every screen must carry a disclaimer pointing to a registered tax agent / the ATO.

---

## 2. PASTE-READY BUILD SPEC

```text
# BUILD SPEC: Tax Companion feature for "Moniq" (Australia-first)

## 0. CONTEXT — the existing app you are extending
Moniq is a personal-finance web app. Match these existing conventions exactly:
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS (no component library); lucide-react icons; framer-motion for animation; recharts for charts; date-fns for dates
- AI: @anthropic-ai/sdk (Claude). An existing AI route lives at /api/coach — reuse the same client setup/key
- Data: Vercel KV / Upstash Redis (no SQL DB). Persist via key-value, namespaced per user
- Bank data: Basiq (Australian open banking). Existing routes: /api/basiq/{user,consent,accounts,transactions,status}. Transactions already flow in from Basiq
- Existing UI patterns/components to reuse: statcard, budgetbar, aiinsightcard, transactionlist, spendingchart, goalcard, sidebar
- The app has a "mode" context (BEGINNER vs ADVANCED) and a theme context (dark/light). The tax feature MUST respect both
- IMPORTANT: this is an ESTIMATE/organiser tool, NOT tax filing or tax advice. Show a clear disclaimer (see section 8)

## 1. GOAL
Add a "Tax" section that, for the Australian financial year (1 July - 30 June):
1. Gives a LIVE estimate of tax payable or refund so the user is never surprised at tax time
2. Uses Claude to scan Basiq transactions and flag likely tax-DEDUCTIBLE work expenses (Keeper Tax / FlyFin style), which the user confirms by swipe/accept-reject
3. Tracks income (salary/wages + side/sole-trader income) toward taxable income
4. Produces a tax-time SUMMARY the user can export (CSV/PDF) to give an accountant or use with ATO myTax
5. Optional GST tracking for sole traders registered for GST

## 2. NAVIGATION / ROUTES
Add a "Tax" item to the sidebar. Create a route /tax (if the app is still single-page, render a Tax view; prefer a real route). Sub-views (tabs): Overview, Deductions, Income, Summary.

## 3. TAX CALCULATION ENGINE (pure, unit-testable module: src/lib/tax/au.ts)
Australian RESIDENT individual rates, FY2025-26 (same as 2024-25). Make brackets a versioned config object keyed by financial year so future years/regions can be added.

Resident income tax (on taxable income):
  $0-$18,200        -> 0%
  $18,201-$45,000   -> 16% of amount over $18,200
  $45,001-$135,000  -> $4,288 + 30% over $45,000
  $135,001-$190,000 -> $31,288 + 37% over $135,000
  $190,001+         -> $51,638 + 45% over $190,000
Plus Medicare Levy = 2% of taxable income (add a simplified low-income reduction note; keep configurable).
taxable income = total assessable income - total accepted deductions.
estimatedTaxPayable = incomeTax + medicareLevy.
estimatedRefundOrOwing = taxWithheld (PAYG from income transactions/manual) - estimatedTaxPayable.
Expose helpers: marginalRate(income), effectiveRate(income, tax), taxOnIncome(income, fy).
Financial year helpers (date-fns): current FY = if month >= July use thisYear->nextYear else prevYear->thisYear. Allow user to switch FY.
DISCLAIMER: estimate only; ignores offsets (LITO etc.), HELP/HECS, private health, capital gains unless explicitly added - list these as "not included" in the UI.

## 4. DEDUCTION DETECTION (the AI differentiator - copy Keeper/FlyFin)
Flow:
- Pull the user's Basiq transactions for the selected FY (expenses only).
- Call Claude (new route POST /api/tax/scan) in BATCHES. For each transaction send: merchant, amount, date, existing category, optional user note.
- Claude returns, per transaction: { isLikelyDeductible: boolean, atoCategory: enum, confidence: 0-1, deductiblePortion: 0-1 (e.g. 0.3 for partial), reason: short string, needsEvidence: boolean }.
- ATO deduction categories enum: CAR_TRAVEL, TRAVEL_EXPENSES, CLOTHING_LAUNDRY, SELF_EDUCATION, WORKING_FROM_HOME, TOOLS_EQUIPMENT_TECH, UNION_SUBSCRIPTIONS, PHONE_INTERNET, DONATIONS, INCOME_PROTECTION_INSURANCE, TAX_AGENT_FEES, OTHER_WORK_RELATED, NOT_DEDUCTIBLE.
- UI: a review queue (swipe/buttons) - ACCEPT (adds to deductions), REJECT, or EDIT (change category / deductible %). Persist user decisions; learn by not re-flagging rejected merchants.
- Show a running "Potential deductions found: $X" and "Confirmed deductions: $Y" total.

Claude system prompt (use latest Claude model, low temperature, structured JSON output):
"You are an Australian tax assistant helping classify personal/business expenses for possible work-related tax deductions under ATO rules. You are NOT a registered tax agent and must not give definitive tax advice. For each transaction, assess whether it is plausibly a work-related deduction for an individual taxpayer, choose the closest ATO category, estimate a deductible portion (many items are only partly deductible, e.g. phone/internet/home-office), and give a one-line reason. Be conservative: if uncertain, set low confidence and needsEvidence=true. Never invent amounts; only classify what is given. Output strictly valid JSON matching the provided schema."
GUARDRAILS: rate-limit /api/tax/scan with @upstash/ratelimit; cache results in KV keyed by transactionId+fy so re-scans are cheap; never send more PII than merchant+amount+date+category.

## 5. INCOME TRACKING
- Auto-detect income from Basiq credits (salary, recurring deposits) and let user confirm/add manual income (side gigs, sole trader invoices).
- Per income source store: type (SALARY_WAGES | SOLE_TRADER | INVESTMENT | OTHER), gross amount, PAYG tax withheld (manual or estimated), employer/source name, FY.
- Sum into total assessable income for the engine.

## 6. GST MODULE (optional toggle, for sole traders registered for GST)
- If enabled: track GST collected on income (1/11 of GST-inclusive sales) and GST credits on deductible business expenses; show net GST estimate per BAS quarter. Keep clearly separate from income tax. Default OFF.

## 7. DATA MODEL (Vercel KV, all keys namespaced by authenticated userId)
- tax:{userId}:{fy}:settings  -> { region:'AU', residency:'resident', gstEnabled, medicareExempt, ... }
- tax:{userId}:{fy}:income[]   -> income sources (see section 5)
- tax:{userId}:{fy}:deductions[] -> confirmed deductions { id, transactionId?, atoCategory, amount, deductiblePortion, evidenceUrl?, note }
- tax:{userId}:{fy}:scan       -> cached Claude classifications + user decisions (accepted/rejected merchant memory)
- All reads/writes MUST verify the authenticated user owns the namespace (server-side).

## 8. UI / UX (respect BEGINNER vs ADVANCED mode + dark/light theme)
Overview tab (hero):
- Big number: estimated REFUND (green) or AMOUNT OWING (red), with a recharts gauge/progress to FY end.
- Stat cards (reuse statcard): Assessable income, Confirmed deductions, Estimated tax, Marginal rate / Effective rate (advanced only).
- "Potential deductions to review: N" CTA -> Deductions tab.
- aiinsightcard: a Claude-generated plain-language summary ("You've got ~$430 in likely deductions to confirm; confirming them could increase your refund by ~$130").
BEGINNER mode: hide marginal/effective rate, GST, BAS; use plain language ("money back" not "refund of overpaid PAYG"); one-tap swipe review; friendly explanations of each ATO category.
ADVANCED mode: full breakdown, deduction register table, marginal vs effective rate, GST/BAS, FY switcher, "what's not included" list.
Deductions tab: the swipe/review queue + confirmed-deductions list (editable, grouped by ATO category, each shows deductible %).
Income tab: income sources list + add manual income.
Summary tab: printable/exportable tax summary (income, deductions by category, estimated tax, refund/owing) -> EXPORT CSV and PDF. This is what they hand to an accountant / use with myTax.
EVERY screen footer: "Estimates only and not tax advice. Tax outcomes depend on your full circumstances. Confirm with a registered tax agent or the ATO (ato.gov.au)."

## 9. API ROUTES TO CREATE
- POST /api/tax/scan      -> run Claude deduction detection over FY transactions (batched, cached, rate-limited)
- GET/POST /api/tax/deductions -> list / upsert / delete confirmed deductions
- GET/POST /api/tax/income     -> list / upsert income sources
- GET /api/tax/summary?fy=     -> computed totals (income, deductions, tax, refund/owing) using src/lib/tax/au.ts
- GET /api/tax/export?fy=&format=csv|pdf -> downloadable summary
All routes: authenticated, user-scoped, typed request/response.

## 10. ACCEPTANCE CRITERIA
- Tax engine returns correct AU FY2025-26 figures (add unit tests: $0, $18,200, $45,000, $90,000, $135,000, $200,000 with/without deductions; verify Medicare levy).
- Scanning real Basiq transactions surfaces a review queue; accept/reject updates totals live and persists.
- Refund/owing recalculates instantly when income or deductions change.
- Beginner mode hides advanced figures; advanced mode shows the full register; both themes look correct.
- Export produces a CSV (and PDF) summary grouped by ATO category.
- Disclaimer is visible on every tax screen; rate-limiting and per-user KV isolation are enforced.

## 11. NOTES / FUTURE
- Region is configurable: brackets/categories live in a per-FY config so NZ/US can be added later (pair with Plaid/TrueLayer for non-AU banks).
- Do NOT attempt actual ATO lodgement; this is a year-round organiser + estimator that hands off to myTax / an accountant.
- Out of scope for v1 (state clearly in UI "not included"): tax offsets (LITO), HELP/HECS repayments, CGT, private health rebate, depreciation schedules.
```

---

## 3. Sources
- Keeper Tax / FlyFin (AI deduction detection): [FinanceBuzz](https://financebuzz.com/keeper-tax-review), [The College Investor](https://thecollegeinvestor.com/39598/flyfin-tax-review/)
- AU tax apps (Hnry, ATO myDeductions, TaxTank): [Canstar](https://www.canstar.com.au/superannuation/tax-apps-to-make-your-life-easier/), [Hnry](https://hnry.com.au/)
- AU FY2025-26 tax brackets + Medicare levy: [SuperGuide](https://www.superguide.com.au/super-booster/income-tax-rates-brackets), [ATO](https://www.ato.gov.au/)
