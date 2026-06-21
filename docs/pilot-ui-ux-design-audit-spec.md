# Pilot: UI/UX, Visual & Design-Psychology Audit + Fix — Build Spec

**Date:** 2026-06-20
**Purpose:** Paste-ready task for a code chat that has the source. Audits everything about how
Moniq looks and feels, judged against PROVEN design principles (WCAG, Nielsen heuristics, Laws of
UX, Norman's emotional design, ethical habit design), then fixes it. Goal: users find it beautiful,
instantly clear, and want to come back — via clarity and delight, NOT manipulation.

## Why grounded, not taste-based
The user asked for design that is "proven to be true and correct." Every check below maps to an
established, citable principle so fixes are defensible, not opinion. A hard guardrail forbids dark
patterns — for a finance app, trust and user wellbeing ARE the retention strategy.

## Paste this into your code chat

```text
# TASK: Full UI/UX, visual & design-psychology audit + fix of "Moniq"

Act as a senior product designer + UX researcher. Audit EVERYTHING about how the app looks and
feels: layout, visual hierarchy, color, typography, spacing, buttons/controls, icons, charts,
motion, microcopy, empty/loading/error states, onboarding, and the emotional/engagement experience.
Judge it against PROVEN, established principles (listed in the REFERENCE below) — not personal
taste. For each issue: LIST it with severity, cite the principle it violates, then FIX it and show
the fix. Goal: a first-time user feels "this is beautiful and effortless," understands it instantly,
and wants to come back — achieved through clarity, delight, and genuine value, NOT manipulation.

## STACK / CONTEXT
Next.js 14 + TypeScript, Tailwind, framer-motion (animation), recharts (charts), lucide-react
(icons). Has dark/light theme and a BEGINNER vs ADVANCED mode. Desktop/laptop is the priority now
(must still be usable down to a small laptop width). It's an Australian personal-finance app.

## HOW TO WORK
1. READ-ONLY pass first. If you can render the app, review each screen visually AND read the code
   (Tailwind classes, theme tokens, components). Produce the findings report (format below). Don't fix yet.
2. Fix in priority order: Critical (broken/unusable/inaccessible) → High → Medium → Low (polish).
3. Establish a DESIGN SYSTEM (tokens) and refactor toward it rather than one-off patches.
4. Run verification (below) and report.

## AUDIT CHECKLIST — go through every item explicitly

### 1. Accessibility & legibility (Critical — measurable, do first)
- Color contrast meets WCAG 2.2 AA: ≥4.5:1 for normal text, ≥3:1 for large text and UI
  components/icons. COMPUTE the ratio for every text/background and key UI pair in BOTH themes;
  list failures with the actual numbers and fix the colors.
- Never convey meaning by color alone (critical for finance red/green): add icons/labels/shapes so
  colorblind users can tell positive vs negative. (~8% of men are colorblind.)
- Body text ≥14–16px; clear typographic scale; line-height ~1.4–1.6; line length ~45–75 chars.
- Visible keyboard focus states on every interactive element; logical tab order; semantic HTML
  (headings in order h1→h2…, real <button>/<a>, alt text, aria labels where needed).
- Respect prefers-reduced-motion (framer-motion) — disable large/looping animation for those users.

### 2. Visual hierarchy & layout (Gestalt, visual hierarchy)
- Each screen has ONE clear focal point / primary action; the eye knows where to land first.
- Size, weight, color, and spacing encode importance (the most important number is the most
  prominent). No "everything is bold" / competing emphasis.
- Use Gestalt: group related items by proximity & common region (cards), align to a grid, use
  consistent whitespace. Remove clutter; let it breathe.
- Consistent spacing scale (8pt grid: 4/8/12/16/24/32…). Flag arbitrary one-off margins/paddings.

### 3. Color system (60-30-10, semantic, brand)
- A defined, limited palette: ~60% neutral surface, 30% secondary, 10% accent for primary actions.
  Flag random/inconsistent colors and consolidate into theme tokens.
- Semantic colors consistent (positive, negative, warning, info) and identical in meaning across
  the app; ensure they still pass contrast and aren't the only signal (see 1).
- Both light AND dark themes fully checked: no invisible text, no pure-black/pure-white harshness,
  consistent elevation/shadows.

### 4. Typography
- One or two font families max; consistent weights. A real type scale (e.g. 12/14/16/20/24/32).
- Numbers/currency use tabular figures so columns align; consistent AUD formatting and decimal use.
- No orphaned all-caps walls, no tiny low-contrast captions.

### 5. Buttons & controls (Fitts's Law, affordance, Von Restorff)
- Primary action is visually distinct and unmistakable on each screen (isolation effect); secondary
  actions are clearly lower-emphasis; destructive actions look distinct and ask for confirmation.
- Click/tap targets ≥40–44px; adequate spacing so they're not mis-hit; clear hover/active/disabled/
  loading states. No "dead" or ambiguous buttons; labels are action verbs ("Add expense", not "OK").
- Consistent component styling (same button = same look everywhere). Consistent border-radius,
  shadow, and icon sizing (lucide) across the app.

### 6. Data visualisation (recharts) — clarity & honesty
- Charts have clear titles, axis labels, legends, and units; the takeaway is obvious in <5 seconds.
- Axes not truncated in a misleading way; proportions honest; categorical colors are
  colorblind-safe and consistent with the app's semantic colors.
- Reduce chart junk (no needless 3D/gradients); tooltips readable; empty-data charts handled.

### 7. Friction, flow & cognitive load (Hick's, Miller's, Jakob's, Doherty)
- Reduce choices per screen (Hick's Law); chunk information (Miller's ~5–7 groups). Progressive
  disclosure — BEGINNER mode hides complexity; ADVANCED reveals it. Verify the mode toggle actually
  simplifies, not just hides.
- Use familiar, conventional patterns (Jakob's Law): nav where users expect, standard icons,
  standard form behavior. No surprising/novel interactions that need learning.
- Perceived performance: skeletons/optimistic UI so actions feel <400ms (Doherty threshold); no
  layout shift (CLS) as data loads.

### 8. Emotional & first-impression design (Aesthetic-Usability Effect, Norman's 3 levels)
- Visceral: the first screen looks polished and trustworthy within ~50ms (credibility matters
  doubly for finance). Cohesive, modern, intentional — not a generic template.
- Behavioral: it's satisfying to use — responsive feedback, smooth (not gratuitous) micro-animations,
  pleasant transitions.
- Reflective: small moments of delight (a tasteful success animation when a goal is hit, warm
  empty states) that make users proud to use and share it.

### 9. Engagement / stickiness — ETHICAL only (Goal-gradient, Endowed progress, Zeigarnik, habit loop)
- Show progress toward goals/budgets prominently (goal-gradient + Zeigarnik motivate completion).
- Onboarding shows early progress (endowed-progress effect) and delivers one "aha" insight fast.
- Give clear, rewarding feedback for positive financial behavior (a cue→action→reward loop) to build
  a healthy habit.
- HARD GUARDRAIL — NO DARK PATTERNS: no manipulative streak-guilt, fake urgency, confirm-shaming,
  hidden actions, or anything that pushes engagement against the user's financial interest. For a
  money app, trust and wellbeing ARE the retention strategy. Flag any existing dark pattern as Critical.

### 10. Consistency & polish (Nielsen heuristics overall)
- Run Nielsen's 10 usability heuristics across the app; flag violations (visibility of system
  status, match to real world, user control/undo, consistency, error prevention, recognition over
  recall, flexibility, minimalist aesthetic, good error messages, help).
- Microcopy: friendly, clear, plain Australian English; consistent terminology; encouraging, never
  blaming tone around money.
- Every state designed: empty, loading, error, success, zero-data, long-content overflow.

## PROVEN-PRINCIPLES REFERENCE (judge against these; cite the one each issue breaks)
- WCAG 2.2 AA contrast: 4.5:1 text, 3:1 large text/UI. (w3.org/WAI)
- Nielsen Norman Group: 10 Usability Heuristics; Aesthetic-Usability Effect. (nngroup.com)
- Laws of UX: Fitts's, Hick's, Jakob's, Miller's, Doherty Threshold, Goal-Gradient, Von Restorff,
  Aesthetic-Usability. (lawsofux.com)
- Gestalt principles (proximity, similarity, common region, closure).
- Don Norman, "Emotional Design": visceral / behavioral / reflective levels.
- Habit loop (cue–action–reward) / "Hooked" — used ETHICALLY only.
- Touch/click targets: Apple HIG ~44px, Material ~48px.
- Color use: 60-30-10 rule; never color as the sole information channel.

## FINDINGS REPORT FORMAT (produce first, before fixing)
Top summary count (e.g. "4 Critical, 7 High, 10 Medium, 6 Low").
Per issue:
- [SEVERITY] — Screen/component (file:line if known)
- Issue: what's wrong
- Principle: which proven principle/heuristic it violates (+ measured value for contrast/size)
- Fix: the concrete change

## FIRST, BUILD A DESIGN SYSTEM, THEN FIX
- Define tokens (in Tailwind config / CSS vars): color palette (light+dark), type scale, spacing
  scale, radius, shadows, motion durations. Fix issues by applying tokens consistently, not ad hoc.

## VERIFICATION (after fixing, report)
- Every text/UI color pair passes WCAG AA in BOTH themes (list the ratios).
- All interactive elements have visible focus + correct target size; full keyboard pass works.
- prefers-reduced-motion respected. No layout shift on load. Lighthouse Accessibility ≥95.
- Spacing/type/color all come from tokens (no stray one-off values).
- Walk through each screen and confirm: one clear focal point, primary action obvious, all states
  designed, charts self-explanatory, copy clear and kind.
- Confirm NO dark patterns remain.

## DELIVERABLE
1. Findings report. 2. The design-system tokens added. 3. Fixes applied (one line each).
4. Verification results (with contrast numbers + Lighthouse a11y score).
5. Anything needing my decision (brand direction, logo, a deliberate style choice).
```

## Sources (established design references)
- WCAG 2.2 contrast: W3C WAI — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
- Usability heuristics + Aesthetic-Usability Effect: Nielsen Norman Group — https://www.nngroup.com/articles/ten-usability-heuristics/
- Laws of UX (Fitts, Hick, Jakob, Miller, Doherty, Goal-Gradient, Von Restorff): https://lawsofux.com/
- Don Norman, *Emotional Design* (visceral / behavioral / reflective)
