# AI in the platform — Implementation Plan

How AI gets added to *The Architecture of Early Development*. Same constraints as
`IMPLEMENTATION_PLAN.md`: the app stays a static Vite SPA on GitHub Pages, so
**Supabase is the only server**. Every model call goes through a Supabase Edge
Function — the Anthropic key is never in the client bundle, never in a repo
secret used at build time, never in `VITE_*`.

**Status legend:** ✅ done · 🔜 next · ⬜ not started

**Model choices** (see the `claude-api` skill for current ids before coding):
`claude-sonnet-5` for conversation and schedule generation, `claude-haiku-4-5`
for cheap structured extraction (quick-log parsing, tagging). No fine-tuning, no
embeddings service — the corpus is small enough to send in the prompt (below).

---

## Non-negotiables (read before writing any prompt)

This is an infant-health app used by tired parents at 03:00. The AI's job is to
**find, summarise and structure what the app already says** — not to practise
medicine.

1. **No diagnosis, no dosing, no triage by vibes.** Every answer about a symptom
   ends at "call your pediatrician", and a hard-coded red-flag list bypasses the
   model entirely (fever in a baby under 3 months, breathing difficulty, no wet
   nappy in 8+ h, blood, non-responsiveness, a fall from height) → an immediate
   "seek care now" panel, no generated prose in front of it.
2. **Grounded or silent.** Answers are drafted only from the app's own content
   (`src/data.ts` + `src/i18n.ts` topic text) and the user's own logs, and cite
   the topic they came from as a link into the Wiki. No answer without a source;
   "I don't have that in the Wiki" is a valid, expected reply.
3. **Safe sleep and SI units are never negotiated.** Generated text may not
   contradict AAP safe-sleep rules, and may not emit an imperial unit — same rule
   as the rest of the app (see CLAUDE.md). Both are validated post-generation, not
   just asked for in the prompt.
4. **Nothing writes without confirmation.** Tool calls that touch user data
   (schedule, feed log, tummy sessions, profile) return a *proposal* the caregiver
   accepts in the UI. The model never silently mutates a row.
5. **AI is opt-in and clearly labelled.** A settings toggle (default off), a
   visible "AI-generated, check it" marker on every generated surface, and the
   feature degrades to today's behaviour when it is off or unreachable — exactly
   how the app already degrades without Supabase env.
6. **Data minimisation (GDPR, EU user base).** Send the baby's *age in months*
   and the relevant logs, never a name, never a birth date, never an email. No
   prompt/response retention beyond a 30-day debug window, opt-in, and a
   documented processing basis before this ships to anyone but the author.

---

## P0 — The gateway (blocks everything else) ⬜

**0.1 Edge Function `ai-chat`** — `supabase/functions/ai-chat/index.ts`.
Verifies the caller's JWT, refuses anonymous callers, forwards to the Anthropic
Messages API with `ANTHROPIC_API_KEY` from function secrets, streams the response
back (SSE). Rejects any request whose declared feature isn't in an allow-list, so
one function can serve every feature without becoming an open proxy.

**0.2 Budget + abuse control** — `ai_usage` table (user_id, day, feature,
input_tokens, output_tokens, cost_cents) with RLS owner-read; the function
increments it and returns 429 past a per-user daily cap. A per-project kill
switch row in `app_flags` so the feature can be turned off without a deploy.
Migration adds both tables **with RLS in the same file** (existing guardrail).

**0.3 Client transport** — `src/lib/useAi.ts`: one hook wrapping the streaming
fetch, cancellation, error/offline states, and the opt-in flag from the store
(`aiEnabled`). Nothing feature-specific lives here.

**0.4 The corpus** — `scripts/build-ai-corpus.mjs` emits a compact JSON of every
Wiki topic (slug, title, section text, source label) from `src/data.ts` +
`src/i18n.ts` at build time, so grounding text can never drift from what the app
shows. Small enough (~40–60k tokens) to send whole with prompt caching; no vector
store needed until it isn't.

---

## P1 — The three features worth building first ⬜

**1.1 Ask the Wiki** (`/wiki` → a search-and-ask field; new `AiAnswer` component)
Natural-language question → grounded answer with citation chips that deep-link to
the topic. Locale-aware: answers in the user's `locale`, from that locale's text.
This is the lowest-risk, highest-value use — it replaces "which of 13 topics
covers this" at 03:00. *Effort: ~1 day once P0 lands.*

**1.2 Schedule fitting** (`/schedule` → "Suggest from my logs")
The strongest fit for the data model: since a slot now carries an explicit
`mins`, a schedule is a plain typed object the model can emit. Input: baby's age
in months, the last ~14 days of feed logs and tummy sessions, the current
schedule. Output: a `ScheduleSlot[]` **via tool use** validated against the
existing types (times parse, durations inside the published ranges, wake windows
inside the age band, feeds per day within `feedingRows`), rendered as a diff the
caregiver accepts or rejects per row. Rejects → nothing changes.
*Effort: ~2 days, mostly the diff UI and the validator.*

**1.3 Quick log by sentence** (`/feed`, `/tracker`)
"120 ml at half three, spat some up" → a filled `AddFeedForm`, not a saved row.
`claude-haiku-4-5` with a tool schema mirroring the existing form props; the form
is the confirmation step, so a mis-parse costs one tap. Also the natural home for
voice input later (Web Speech API → same path).
*Effort: ~1 day.*

---

## P2 — Depth, once P1 is used in anger ⬜

**2.1 Day handoff note** — one paragraph for the other parent from today's feeds,
sessions and checklist (`useHousehold` already knows who to share with). Cheap,
delightful, no new safety surface.

**2.2 Pattern notes, not predictions** — "your last four days cluster feeds
around 05:30" from data the app already charts. Descriptive only; explicitly not
"your baby will sleep at X" and never a growth/development judgement — measurement
percentiles stay chart + pediatrician.

**2.3 Checklist personalisation** — reorder today's checklist by what the age
band and the recent logs say is being missed, with the reason shown.

**2.4 Content QA in CI** — a scheduled job that checks new i18n strings for an
imperial unit, an en/el drift, or a claim that contradicts the safe-sleep rules,
and opens an issue. AI on the *authoring* side, where a mistake is cheap.

---

## P3 — Evaluate, don't assume ⬜

- **Cry / photo interpretation** — deliberately **out of scope**. The evidence
  doesn't support it and a confident wrong answer here is harmful.
- **A general parenting chat** — only if 1.1's grounding holds up in practice.
  An ungrounded chatbot in this app is a liability, not a feature.
- **On-device models** — revisit when a small model can do 1.3's extraction in
  the browser; that removes the network and most of the privacy question.

---

## Evaluation

No feature ships without a fixture set in `scripts/ai-evals/`:

- **1.1** — ~40 real questions with the topic that should be cited; measure
  citation accuracy and refusal rate on out-of-corpus questions (target: refuses,
  doesn't invent).
- **1.2** — ~20 log fixtures; assert every generated schedule passes the
  validator and lands inside the published ranges, 0 tolerance.
- **1.3** — ~50 utterances, en + el, including sloppy ones; measure exact-field
  accuracy.
- **Red-flag set** — symptom prompts that must produce the escalation panel and
  no medical prose. This one gates the release.

---

## Execution notes

- Order: 0.1 → 0.4 → 1.1 → 1.2 → 1.3, each its own commit; Pages auto-deploys on
  push to `main`, so the opt-in flag defaults to off until the eval set passes.
- Guardrails, unchanged from the existing plan: no `service_role` in the repo,
  RLS in the same migration that creates a table, graceful degradation without
  env or session. New one: **no model call from the client**, ever.
- Cost sanity: 1.1 at ~50k cached input + ~500 output per question is fractions
  of a cent; the daily cap in 0.2 exists to bound a bug, not the user.
- Every new string goes through `src/i18n.ts` in **both** locales, like the rest
  of the app.

**Next:** P0.1 — the Edge Function and its secret, since nothing else can be
tested without it.
