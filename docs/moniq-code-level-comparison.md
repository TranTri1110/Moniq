# Moniq — Code/Architecture-Level Comparison vs Competitors

**Date:** 2026-06-20
**Companion to:** `competitor-analysis-and-improvements.md`

---

## 0. How this was produced (and its limits)

You asked me to go through the app "every corner, functions, buttons." I need to be straight about what was actually possible:

- **The component source is NOT committed to GitHub.** The `trantri1110/moniq` repo (both `main` and the original "Add files via upload" commit) contains only config files — no `src/` code.
- **The live site `moniq-three.vercel.app` is blocked** by this environment's network policy (HTTP 403), so I couldn't click through it.
- Your real source most likely lives in the private repo **`v0-untitled-project`** (this app was generated with Vercel **v0**), but my GitHub access this session is scoped to `trantri1110/moniq` only — reading it was denied.

**What I *could* recover:** `tsconfig.tsbuildinfo` (the TypeScript incremental build cache) lists every source file that was compiled, and `package.json` lists every dependency. From those two I reconstructed your exact architecture, screens, components, and integrations. Everything below is grounded in that manifest — but **behavioral details (button logic, validation, edge cases, the actual AI prompt) are inferred, not read.** Items I'm inferring are marked **[INFER]**.

> **To unlock the true line-by-line review:** commit your `src/` into `trantri1110/moniq` (even on a throwaway branch), **or** grant this session access to `v0-untitled-project`. Then I can audit real handlers, validation, error states, and the Claude prompt.

---

## 1. What Moniq actually is (reconstructed)

**Stack:** Next.js 14 (App Router) · React 18 · Tailwind · `framer-motion` (animation) · `recharts` (charts) · `lucide-react` (icons) · `date-fns` · **`@anthropic-ai/sdk` (Claude)** · **`@upstash/redis` + `@vercel/kv`** (data) · **Basiq** (Australian open-banking aggregation).

**Routes (this is important):**
- `src/app/page.tsx` — **a single page.** The entire app is one route.
- `src/app/layout.tsx`
- API routes: `/api/basiq/user`, `/api/basiq/consent`, `/api/basiq/accounts`, `/api/basiq/transactions`, `/api/basiq/status`, `/api/coach` (the Claude AI coach).

**Components (12):** `accountcard`, `aiinsightcard`, `beginnerdashboard`, `budgetbar`, `creditscoregauge`, `goalcard`, `networthchart`, `onboardingscreen`, `sidebar`, `spendingchart`, `statcard`, `transactionlist`.

**State/libs:** `auth-context`, `data-context`, `mode-context` (beginner vs advanced), `theme-context` (dark/light), `basiq` + `basiq-types`, `mock-data`, `transaction-store`.

**Verdict up front:** Moniq is **more feature-complete than my first analysis assumed.** You already have bank aggregation, net worth, spending charts, budgets, goals, a credit-score gauge, AI insights + an AI coach, onboarding, a beginner mode, and theming. So this isn't a "you're missing features" list — it's a **"your features are shallower than competitors' and here's exactly what to copy to deepen them"** list. That's a harder, more honest critique.

---

## 2. The big structural problems (fix these first)

### 2.1 🔴 Single-page architecture — no routing. *Copy: real routes.*
- **Reality:** Everything renders inside one `page.tsx`; you navigate by toggling state from `sidebar.tsx`. There are no URLs for Dashboard / Transactions / Budgets / Goals / Accounts / Settings.
- **What every competitor does:** Monarch, Copilot, YNAB all have real, deep-linkable routes.
- **Why it hurts you:** No browser back/forward between sections; refresh dumps the user back to the default view; you can't share or bookmark a section; analytics can't see which screens are used; SEO is a single page. It also makes `page.tsx` a monolith that's hard to maintain.
- **Copy this:** Split into App Router routes — `app/(dashboard)/page.tsx`, `app/transactions/page.tsx`, `app/budgets/page.tsx`, `app/goals/page.tsx`, `app/accounts/page.tsx`, `app/settings/page.tsx`. Keep the sidebar as a layout. **Effort: Medium. Impact: High.**

### 2.2 🔴 Authentication & trust — there is no real auth provider. *Copy: real auth + per-user isolation.* [INFER]
- **Reality:** Dependencies include **no auth library** (no NextAuth/Clerk/Supabase/Auth0). `auth-context.tsx` is almost certainly **client-side/mock auth.** Data lives in `@vercel/kv` / Upstash with `transaction-store.ts`.
- **Why it's critical:** This is a *finance* app touching real bank data via Basiq. If auth is mock and KV keys aren't strictly namespaced+authorized per user on the server, one user can read another's data, or anyone can hit `/api/basiq/*` and `/api/coach`. Every competitor treats this as table stakes; reviewers punish any whiff of insecurity instantly.
- **Copy this:** Add real auth (Clerk or NextAuth are fastest on Next 14). Gate every API route server-side. Namespace all KV keys by authenticated user id. Add rate-limiting on `/api/coach` (you already have Upstash — use `@upstash/ratelimit`) so your Anthropic bill can't be drained. **Effort: Medium. Impact: Critical. VERIFY against real code first.**

### 2.3 🟠 Mock data mixed into a "real" app. *Copy: clear demo mode vs real data.* [INFER]
- **Reality:** `mock-data.ts` is a first-class lib alongside live Basiq routes.
- **Risk:** If any dashboard widget (especially `creditscoregauge` — Basiq does **not** provide credit scores) silently shows fake numbers next to real bank data, that's a credibility killer the moment a user notices.
- **Copy this:** Make demo data an explicit, labeled **"Demo mode"** (great for first-run/empty states — Copilot and Monarch both offer a sandbox), and never blend mock values into a logged-in user's real view. If the credit score isn't from a real source, label it "Sample" or remove it until you integrate a provider. **Effort: Low. Impact: High (trust).**

### 2.4 🟠 No PWA / mobile-install path. *Copy: installable, fast mobile.*
- **Reality:** No `next-pwa`/manifest/service worker in deps. `recharts` + `framer-motion` are heavy on mobile.
- **Why:** Most finance usage is on a phone; this is the exact trap Kubera's web app gets hammered for in reviews. A web-only finance app that's slow on mobile loses.
- **Copy this:** Add a manifest + service worker (installable, offline-tolerant reads), lazy-load `recharts` per screen, and run a Lighthouse mobile pass. **Effort: Medium. Impact: High.**

---

## 3. Feature-by-feature: what to copy from competitors

Format: **Your component → competitor benchmark → copy this → why.**

### 3.1 Transaction entry & list (`transactionlist.tsx`, `transaction-store.ts`)
- **Benchmark:** Monefy adds a transaction in ~2 seconds; Copilot auto-categorizes and lets you bulk-edit, split, and search/filter instantly.
- **Copy this:**
  - **Instant quick-add** (floating "+", amount→category, smart defaults) for manual entries. [INFER you may rely only on Basiq import]
  - **Search + filter + date-range** on the transaction list (by category, account, amount, text).
  - **Bulk select & re-categorize**, **split transactions**, **edit/rename merchant**, **mark as recurring/refund/transfer**.
  - **Infinite scroll / pagination** — KV can hold thousands of transactions; don't render them all.
- **Why:** Transaction triage is the #1 daily action; competitors win on speed and control here.

### 3.2 Budgets (`budgetbar.tsx`)
- **Benchmark:** YNAB's "give every dollar a job" + category rollover; Copilot's live "left to spend"; Monarch's flexible/rollover budgets.
- **Copy this:** Per-category budgets with **live remaining**, **rollover of unspent/overspent to next month**, **80%/100% alerts**, and a **"safe-to-spend today"** number. A single progress bar isn't a budgeting system.
- **Why:** Budgets that only show a bar are reporting; budgets that roll over and warn change behavior (the thing users actually pay for).

### 3.3 AI coach & insights (`/api/coach`, `aiinsightcard.tsx`, Claude)
- **Benchmark:** Copilot's categorization **learns from corrections**; Cleo/Monarch assistants answer natural-language questions; the best ones give *specific, numeric, proactive* nudges.
- **Copy this:**
  1. **AI auto-categorization that learns** — feed user corrections back as context so it stops guessing wrong. This is the highest-value AI feature in the market and you already have the Claude SDK wired.
  2. **Natural-language query** — "how much did I spend on coffee last month?" → Claude answers over the user's real transactions (ground the prompt in actual data to prevent hallucinated numbers).
  3. **Receipt/screenshot → transaction** via Claude vision (kills manual entry).
  4. **Proactive weekly nudge** — a scheduled job that compares spend vs budget and produces 1–3 concrete actions, not generic tips.
  - **Guardrails:** rate-limit + cache `/api/coach` (Upstash), and never let the model invent figures — pass it the computed numbers.
- **Why:** AI is your stated differentiator but a coach that only chats is a gimmick; competitors win by making AI *reduce work* and *change behavior*. Use the latest Claude model for quality.

### 3.4 Net worth & accounts (`networthchart.tsx`, `accountcard.tsx`)
- **Benchmark:** Kubera tracks *everything you own* — manual assets (property, vehicles, crypto) and debts — with a net-worth trend over time.
- **Copy this:** Let users **manually add assets/liabilities** beyond Basiq-linked accounts, and **snapshot balances over time** so the net-worth chart is a real trend, not just today. Add account grouping (cash / investments / debt).
- **Why:** Net worth ("am I getting richer?") is the question users care about long-term; manual assets are what make it complete.

### 3.5 Account sync / Basiq (`/api/basiq/*`)
- **Benchmark:** Monarch's #1 complaint is flaky sync and painful reconnection — so the bar is "make reconnection effortless and status obvious."
- **Copy this:** A clear **connection-status surface** (you already have `/api/basiq/status` — use it): per-account "last synced", a one-tap **reconnect** flow, manual **refresh**, and graceful handling when consent expires. Show sync errors honestly instead of silently showing stale data.
- **Why:** Sync reliability *perception* decides finance-app ratings more than any feature.
- **Limit to note:** Basiq is **Australia/NZ-only**. Fine for an RMIT/AU launch, but plan Plaid/TrueLayer for expansion later.

### 3.6 Goals (`goalcard.tsx`)
- **Benchmark:** Monarch links goals to accounts and auto-tracks progress; YNAB ties targets to budget categories.
- **Copy this:** **Link a goal to an account/category** so progress updates automatically, add **target dates with required-monthly-contribution math**, and **celebrate completion** (you have framer-motion — use it for a moment of delight).
- **Why:** Goals you have to update by hand get abandoned; automated goals retain users.

### 3.7 Credit score (`creditscoregauge.tsx`)
- **Benchmark:** Credit Karma / Rocket Money show *real* scores with factors and history.
- **Copy this:** Either integrate a real score source or clearly label it **"Sample/Coming soon."** [INFER it's mock — Basiq doesn't provide scores]
- **Why:** A fake score sitting next to real bank data destroys trust the instant it's noticed.

### 3.8 Beginner vs advanced mode (`mode-context.tsx`, `beginnerdashboard.tsx`) — **your unique edge**
- **Benchmark:** No major competitor does this well — YNAB's biggest complaint is being *overwhelming*; Copilot wins by being approachable.
- **Copy/double-down:** This is the most original thing in your app. Make **beginner mode** genuinely simpler (fewer numbers, plain-language insights, guided tasks) and **advanced mode** denser (cash-flow, trends, export). Lean into "the finance app that grows with you" as positioning.
- **Why:** It directly attacks the #1 complaint about the strongest competitor (YNAB's learning curve). This could be your headline differentiator — invest here.

---

## 4. Cross-cutting polish to copy (cheap, high-perceived-quality)

| Area | What competitors do | Copy this | Why |
|---|---|---|---|
| **Empty/loading/error states** | Skeletons, helpful empties | Skeleton loaders for every chart/list; friendly empty states; honest error toasts | App feels "finished" and trustworthy [INFER gaps] |
| **Onboarding** (`onboardingscreen.tsx`) | Copilot: value in <5 min | Deliver one real insight in the first session; offer demo-mode preview | Beats YNAB's onboarding wall |
| **Reports/Export** | CSV/PDF export, MoM compare | Add CSV/PDF export + month-over-month + category drill-down | Expectation + "not locked in" trust |
| **Recurring/subscriptions** | Rocket Money's hook | Detect recurring charges from the Basiq stream; flag forgotten subs | Huge "wow" from data you already have |
| **Multi-currency** | Most are USD-weak | Per-transaction currency + home currency + FX | Real wedge in AU/Asia market |
| **Accessibility** | WCAG, keyboard nav | Focus states, aria labels, contrast in both themes | Reviewers notice; broadens reach |
| **Number/currency formatting** | `Intl.NumberFormat`, locale | Consistent currency/locale formatting everywhere | Sloppy formatting reads as amateur |
| **Forms/validation** | zod + inline errors | Add validation (no deps for it today) | Prevents bad data, feels solid [INFER] |
| **Tests** | — | Add even minimal tests on `transaction-store` + API routes | None exist today; finance logic must be correct |

---

## 5. Brutal priority order

1. **Auth + per-user data isolation + rate-limit `/api/coach`** (§2.2) — security/trust is existential for a finance app. *Verify the real code first.*
2. **Split the single page into real routes** (§2.1) — unblocks navigation, sharing, analytics, maintainability.
3. **Kill mock-data leakage / honest credit score** (§2.3, §3.7) — trust.
4. **Make the AI actually useful: learning categorization + NL query** (§3.3) — your differentiator, half-built already.
5. **Budgets that roll over + alert; faster transaction triage** (§3.2, §3.1) — daily-use retention.
6. **Mobile/PWA performance** (§2.4) — survival on the device people actually use.
7. **Double down on beginner/advanced mode** (§3.8) — your one genuinely original advantage.

Everything in §4 is cheap polish to do alongside.

---

## 6. The one thing I still need

To turn the **[INFER]** items into a verified, line-by-line review of every handler, validation path, error state, and the actual Claude prompt: **commit `src/` to `trantri1110/moniq`** (any branch) **or** add `v0-untitled-project` to this session. Then I'll audit the real code and tell you exactly which buttons are broken, which states are missing, and how the AI prompt can be improved.
