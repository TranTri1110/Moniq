# Moniq — Best Way to Launch the MVP (off v0, desktop web)

**Date:** 2026-06-20
**Scope:** Launch the existing MVP for real users on **laptop/desktop web** (mobile deferred).

---

## 1. Clear up the v0 misconception (this makes it easy)

**v0 is a code generator, not a hosting platform you "launch on."** The code v0 wrote is standard **Next.js + React + Tailwind** — the same thing you'd write by hand. "Getting off v0" does **not** mean rebuilding. It means:

1. Treat your **GitHub repo as the source of truth** (you already have the v0→GitHub sync: the private `v0-untitled-project` repo).
2. Develop in a **real environment** (locally in an IDE, or with Claude Code) — stop editing in the v0 chat.
3. **Deploy on Vercel** (or similar) straight from GitHub.

That's it. v0 was the scaffolding; you keep the building.

---

## 2. The best launch stack (desktop web MVP)

| Layer | Best option | Why |
|---|---|---|
| **Code/source** | GitHub repo (the v0 sync) | Version control, real collaboration, hand-off to a dev |
| **Hosting** | **Vercel** | Built for Next.js, zero-config deploys from GitHub, free/Pro tier, custom domain |
| **Auth** | Clerk or NextAuth/Auth.js | Real per-user login (your current `auth-context` is mock) |
| **Data** | Keep Vercel KV/Upstash for MVP | Fine for a small pilot; move to Postgres/Supabase if users grow |
| **AI** | Anthropic (already wired) | Add rate-limiting via Upstash |
| **Bank data** | Basiq — **see §4 (sandbox vs production)** | The biggest gating decision |
| **Monitoring** | Sentry (free tier) + Vercel Analytics | Know when it breaks without watching it |

Because you're **desktop-only for now**: you can skip PWA/offline/app-store work entirely. Just make sure the layout is comfortable on common laptop widths. That removes a lot of cost.

---

## 3. Migration off v0 — step by step

1. **Adopt the GitHub repo as source of truth.** Confirm `v0-untitled-project` (or whichever repo) has the full current source. Clone it locally.
2. **Get it running locally** (`npm install` → `npm run dev`) so you're no longer dependent on v0's preview.
3. **Connect that repo to a Vercel project** → every push to `main` auto-deploys. Add a custom domain (e.g. moniq.app).
4. **Move secrets to environment variables** in Vercel (Basiq keys, Anthropic key, KV creds) — never commit them.
5. **From now on, all changes go through GitHub + Vercel**, not v0. (You can still use v0 to prototype a new screen, then paste it in — but the repo is canonical.)

---

## 4. The decision that defines "launch for users": Basiq **sandbox vs production**

You said you have **sandbox data**. This is the single most important thing to understand:

- **Sandbox = fake test banks only.** Real users **cannot** connect their real accounts. It's perfect for demos, pilots, and feedback — but it's not a "real" finance product yet.
- **Production Basiq = real bank connections.** Requires **applying for Basiq production access**, and because it's Australian open banking (CDR), it brings privacy/consent/security obligations + a privacy policy & terms.

So "launch for users" means one of two very different things:

**Path A — Pilot/Demo launch (recommended first).**
- Deploy the app on Vercel with **sandbox/demo data**, behind a simple login.
- Let real people *use the experience* (dashboard, AI coach, tax, budgets) with sample data.
- Goal: validate the product, gather feedback, show investors/users — **no compliance burden, cheap, fast.**
- Add a clear "Demo data" label so no one thinks it's their real bank.

**Path B — Real production launch.**
- Apply for **Basiq production**, add **real auth + per-user data isolation**, get **privacy policy + terms** (lawyer), security review.
- Only worth doing once Path A proves people want it.

> **Bottom line:** with sandbox data, the *best* and most honest launch right now is **Path A — a polished pilot on Vercel** to get real users trying it and giving feedback. Don't conflate "deployed" with "handling real money."

---

## 5. Minimum hardening before you share it with anyone

Even for a pilot:
1. **Real login** (replace mock auth) — so users have their own space and you don't leak data between testers.
2. **Per-user data isolation** in KV (namespace every key by user id, verified server-side).
3. **Rate-limit the AI route** (`/api/coach`, and `/api/tax/scan` if added) so usage can't drain your Anthropic bill.
4. **Label demo/sandbox data** clearly.
5. **Error monitoring** (Sentry) so you hear about crashes.
6. A basic **privacy note** even for a pilot (you're collecting emails/usage).

---

## 6. Recommendation (shortest path to users)

1. Make the **GitHub repo canonical**, run locally, **deploy on Vercel** with a custom domain. *(You're now off v0.)*
2. Add **real auth + per-user isolation + AI rate-limiting + a "demo data" label.*
3. **Launch as a Path A pilot** on desktop web — invite real users, collect feedback.
4. Keep **sandbox** until the pilot proves demand; *then* pursue **Basiq production + legal** for Path B.
5. Maintenance: on-demand + Sentry alerts (per the hiring/cost doc).

**Cost to do just this:** if you do the deploy + demo yourself it's near-$0 (Vercel free/Pro ~US$20/mo); paying a freelancer to add auth + harden + deploy is a small slice of the Option A range (~$2–6k).

---

## 7. Why Vercel over alternatives (briefly)
- **Vercel:** best Next.js fit, simplest. **← use this.**
- Netlify/Cloudflare Pages: fine, slightly more config for Next.js features.
- Render/Railway/a VPS: more control, more ops work — unnecessary for an MVP.
- Staying in v0: not a launch target; fine only for prototyping.
