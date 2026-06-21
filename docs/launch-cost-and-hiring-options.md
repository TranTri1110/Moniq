# Moniq — Cost & Process to Hire a Developer and Launch

**Date:** 2026-06-20
**Currency:** AUD unless noted. All figures are **planning estimates, not quotes** — get 3 written quotes before committing.

---

## 1. Reality check: where Moniq is today

What you have is a **working prototype**, not a launchable product. Specifically (from the code review):
- A **Vercel v0-generated Next.js web app** (single page, ~12 components).
- Real integrations wired: **Basiq** (open banking), **Claude** (AI coach), **Vercel KV/Upstash**.
- **Gaps that block a real launch:** no real authentication / per-user data isolation, mock data mixed with real data, no real routing, no tests, no CI/CD, web-only (no native mobile), no privacy/terms/security review.

This matters because **most of the cost to "launch" is not new features — it's turning a demo into something safe to put real people's bank data into.** That's the honest headline.

**Extra wrinkle — this is fintech.** Touching bank data via Basiq means privacy law (Australian Privacy Principles), secure data handling, and operating under Basiq's CDR/Consumer Data Right model. General agencies often aren't set up for this; it adds cost and a legal step. You don't need an ASIC licence to be a budgeting/insights tool, but you **do** need proper privacy/terms and a security posture.

---

## 2. What "launch" actually includes (work breakdown)

| Workstream | What it is | Rough effort |
|---|---|---|
| **Hardening / productionization** | Real auth, per-user data isolation, remove mock data, error/loading states, rate-limit the AI route | 2–4 weeks |
| **Refactor & code health** | Split single page into routes, typing, tests, CI/CD, monitoring | 1–3 weeks |
| **Feature completion + QA** | Finish/verify budgets, goals, tax, etc.; bug-fix; cross-device testing | 2–4 weeks |
| **Design polish** | Consistent UI, mobile responsiveness, accessibility, empty states | 1–2 weeks |
| **Mobile (optional)** | PWA (cheap) **or** native iOS/Android (expensive) | 0 / +6–12 weeks |
| **Compliance & legal** | Privacy policy, terms, Basiq production access, security review/pen test | 1–3 weeks + legal fees |
| **Launch** | Production infra, domain, app-store submission (if native), beta | 1–2 weeks |

**Decision that swings cost the most: web/PWA vs native mobile.** Your app is already web. Shipping it as a polished **installable PWA** is dramatically cheaper than building native iOS/Android apps. For a v1, PWA is the smart, cheap choice.

---

## 3. Cost options (4 realistic paths)

### Option A — Solo freelance contractor (productionize the web app/PWA)
- **Who:** one strong full-stack Next.js dev (local AU or offshore SE-Asia).
- **Scope:** harden + polish + launch the existing web app as a PWA. No native apps.
- **Cost:** **$8,000–$25,000** one-off.
  - Local AU freelancer: $100–200/hr → upper end.
  - Offshore SE-Asia: ~$40–90 AUD/hr → lower end.
- **Best for:** validating with real users on a budget. **This is the most likely right first step for you.**
- **Risk:** quality/communication varies; you manage them; bus-factor of one.

### Option B — Boutique AU agency / studio (full launch, incl. native if wanted)
- **Cost:** **$60,000–$180,000+** depending on native vs web and scope.
- **Includes:** project management, design, QA, some compliance help.
- **Best for:** if you raise money or want a polished native launch with low management overhead.
- **Risk:** expensive; overkill before you have users/revenue.

### Option C — Offshore / hybrid agency
- **Cost:** **$25,000–$70,000** for a full launch; ~30–50% cheaper than local.
- **Sweet spot:** offshore build + local senior oversight (hybrid).
- **Best for:** more scope than a freelancer, less spend than a local agency.
- **Risk:** time-zone/communication; vet for **fintech** experience specifically.

### Option D — In-house hire (full-time developer)
- **Cost:** **$90,000–$140,000/yr** salary (AU mid–senior) + on-costs (~+25%).
- **Best for:** only once Moniq is a funded, growing business — **not** for launch.

### Option E — Technical co-founder (equity, ~$0 cash)
- **Cost:** equity instead of cash.
- **Best for:** if you want to build a real startup and can find the right person. Highest long-term leverage, but giving up ownership and hard to reverse.

---

## 4. The process / timeline (what working with them looks like)

1. **Discovery & scope (week 0–1):** share the repo + the spec docs in this folder; agree scope, fixed-price vs hourly, milestones.
2. **Hardening sprint (weeks 1–4):** auth, data isolation, remove mock data, security basics.
3. **Build/refactor & QA (weeks 3–8, overlapping):** routes, feature completion, tests, polish.
4. **Compliance & legal (parallel):** privacy policy + terms (a lawyer, not the dev), Basiq production credentials, optional security review.
5. **Closed beta (weeks 8–10):** small group of real users; fix what breaks.
6. **Launch (weeks 10–12):** production infra, monitoring, public release (PWA) or app-store submission (native, +2–4 weeks review).
7. **Post-launch:** see §5.

**Realistic timeline to a real launch:** **6–12 weeks** for a hardened web/PWA via a good freelancer/small team; **3–6 months** for a native, agency-built launch.

**Always:** fixed-price milestones for v1 (not open-ended hourly), you keep the GitHub repo + all credentials/accounts in **your** name, and agree on a 30-day post-launch bug-fix warranty.

---

## 5. After launch: do you need someone constantly? (the key question)

**No — you do not need a full-time developer babysitting a small app.** But "zero" is also wrong for fintech: bank/API integrations break, dependencies need security patches, and you need to know if it goes down. Pick a maintenance model that matches activity:

| Model | What it is | Cost (AUD) | Best when |
|---|---|---|---|
| **On-demand / "hire when needed"** | Same dev on call; you pay per fix/feature | ~$100–200/hr local, less offshore; $0 when idle | Early, low traffic, few users — **likely you at first** |
| **Light retainer** | A set block of hours/month for patches, monitoring, small tweaks | **$500–$2,000/mo** | Live app with real users; want guaranteed response |
| **Full retainer / managed** | Agency owns uptime, monitoring, SLA, updates | **$2,000–$6,000+/mo** | Revenue-generating, can't afford downtime |
| **Part-time / fractional dev** | A few days a month, ongoing roadmap | ~$2,000–$5,000/mo | Actively iterating with users |
| **Full-time hire** | Dedicated | $90k–140k/yr | Funded, scaling — later |

**Recommended for your stage:** launch via a **freelancer (Option A)**, then keep them on **on-demand or a small retainer (~$500–1,000/mo)**. The critical thing isn't a person sitting there — it's **automated monitoring/alerts** (uptime, error tracking like Sentry) so you only call someone when something actually breaks.

---

## 6. Ongoing running costs (separate from people — these never stop)

Even with nobody working on it, the app costs money to run:
- **Hosting:** Vercel Pro ~US$20/mo + usage.
- **Data:** Upstash/Vercel KV — usage-based, small early.
- **Basiq (open banking):** typically **priced per connected user/connection** — this can become your biggest variable cost as users grow; confirm their production pricing.
- **Anthropic (Claude) API:** per-usage; the AI coach/tax scan costs scale with use — **cache + rate-limit** to control it.
- **App stores (only if native):** Apple $149/yr, Google $25 once.
- **Domain, email, error monitoring (Sentry free tier ok early).**
- **Rough early total:** **~$50–300/mo** before you have many users; scales with Basiq + Claude usage.

---

## 7. My recommendation for your situation

1. **Don't build native yet.** Ship the existing app as a **polished, hardened PWA** — cheapest path to real users.
2. **Hire one vetted full-stack freelancer (Option A), fixed-price, ~$8–25k**, scoped to: auth + data isolation, remove mock data, routing, polish, compliance basics, launch.
3. **Get a lawyer** for privacy policy + terms (a few hundred to ~$2k) — don't skip this for a finance app.
4. **After launch, go on-demand + a small retainer** and rely on **automated monitoring**. Hire more only when users/revenue justify it.
5. **Keep ownership:** repo, Basiq, Vercel, Anthropic, domain — all in your name/accounts.
6. **Validate before spending big.** A v1 PWA + 50–100 real users tells you whether a $60k+ native build is ever worth it.

**Ballpark to get launched and running for ~6 months:** roughly **$12k–$30k all-in** via the freelancer path (build + legal + a few months of light maintenance + infra) — versus **$60k–$180k+** for the full agency/native route. Start small.

---

## 8. Sources
- AU developer & app costs 2026: [Lemon.io](https://lemon.io/rate-calculator/australia/), [8ration](https://www.8ration.com/blogs/app-development-costs-in-australia/), [Appinventiv](https://appinventiv.com/blog/mvp-app-development-in-australia/)
- Fintech build cost + offshore: [Netguru](https://www.netguru.com/blog/fintech-app-development-cost), [Decipher Zone](https://www.decipherzone.com/blog-detail/mvp-development-cost-australia-vs-offshore), [Cleveroad](https://www.cleveroad.com/blog/fintech-app-development-cost/)
