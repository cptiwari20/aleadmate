# aLeadMate — Product & Build Plan

**Positioning:** the open library of lead-gen playbooks that actually worked.
Free to read, free to copy, no login wall. Every guide, flow, and funnel is a live,
forkable object — not a PDF.

**Status:** planning. `main` is a clean slate; the previous local-first CRM lives on
the `legacy` branch (and `crm_legacy` on the remote).

---

## 1. Why the previous direction wouldn't spread

The legacy product was a browser-first mini-CRM with a $5/mo sync plan. Nothing wrong
with it, but CRMs have no native distribution loop: the artifact a user creates
(their pipeline) is private by definition, so nothing ever leaves the app. Growth
has to be bought.

The pivot fixes exactly that. The artifact becomes **public by default** — a funnel,
a sequence, a playbook — and every artifact is a landing page that recruits the next
user. The CRM doesn't disappear; it becomes the "run it" layer you graduate into
*after* you've forked something.

---

## 2. Content primitives

Five objects, deliberately small. Everything on the site is one of these.

| Object | What it is | Example |
|---|---|---|
| **Play** | One atomic asset | A single cold email, a DM opener, an ad hook, an objection response |
| **Flow** | Ordered Plays with timing, triggers, branches | A 6-touch cold email sequence over 18 days |
| **Funnel** | End-to-end motion: source → asset → Flow → offer → close, with stage benchmarks | LinkedIn content → lead magnet → nurture → demo |
| **Playbook** | The narrative guide: who it's for, why it works, what to expect, what breaks | "Outbound for agencies selling to e-comm brands" |
| **Result** | A reported outcome attached to any of the above | "3.1% reply, 42 demos, n=1,400, Mar 2026" |

Plus **Stack** (tools a Funnel needs) — a browsable dimension and a natural sponsor
surface later.

**Results are the moat.** Swipe files are everywhere; swipe files with attached,
dated, sample-sized outcomes are not. This is the single thing that makes a page
worth sharing rather than bookmarking.

### Proof tiers (be honest about these)

- **Unverified** — self-reported by the author. Labelled as such, always.
- **Community-signal** — N forkers reported back with their own numbers; show the spread, not just the best case.
- **Verified** — screenshot or connected data source. Rare, high trust, visually distinct.

Never blur these. The credibility of the whole library is the product.

---

## 3. The viral loops

Ranked by expected leverage. Loop 1 and 3 are non-negotiable for launch.

1. **Fork loop (primary).** Every object has "Fork this funnel." Reading needs no
   account; forking does. Fork count is shown publicly, which feeds creator ego and
   ranking simultaneously. This is the GitHub/Figma loop.
2. **Creator loop.** Public profile at `/@handle` with total forks and results.
   Creators promote their own playbooks to their own audience — distribution you
   don't pay for. Every serious contributor is an acquisition channel.
3. **Share-card loop.** Auto-generated OG images per object showing title, channel,
   headline metric, author, fork count. This is not a nice-to-have — on LinkedIn and
   X, the card *is* the click-through rate.
4. **Screenshot loop.** The funnel diagram and flow timeline are designed to be
   screenshotted and posted. Legible at 600px wide, watermarked with the URL.
5. **Embed loop.** `<script>` embed of any flow for blogs and Notion → backlinks and
   branded impressions on other people's sites.
6. **Digest loop.** Weekly "What's working now" — top new results across the library.
   Email *and* a permanent shareable web page per issue.
7. **Free-tool wedge.** One or two single-purpose free tools (cold email grader,
   funnel benchmark calculator) that rank on their own and feed the library. Highest
   historical ROI vector in this category — but Phase 4, not launch.

**Anti-friction rules that protect every loop:** no login to read, no login to copy a
play to clipboard, no email gate on any public page, no interstitials. Every gate you
add multiplies against the share rate.

---

## 4. Information architecture & SEO

The library is a compounding SEO asset — hundreds of pages, each targeting real
long-tail intent. URL design is a growth decision, not a detail.

```
/p/[slug]                       playbook
/f/[slug]                       funnel
/flow/[slug]                    flow
/play/[slug]                    play
/c/[channel]                    /c/cold-email, /c/linkedin, /c/seo, /c/paid
/for/[icp]                      /for/saas-founders, /for/agencies, /for/dentists
/c/[channel]/for/[icp]          programmatic long-tail — the volume play
/stack/[tool]                   funnels that use Apollo, Instantly, Clay…
/@[handle]                      creator profile
/whats-working                  live leaderboard, weekly digest archive
```

Facets for browse and for the programmatic pages: channel, ICP, motion
(outbound/inbound/PLG/partner), deal size, sales-cycle length, difficulty,
time-to-first-lead, cost-to-run.

Rendering: public pages statically generated with ISR (fast, cheap, crawlable);
the workspace is dynamic. Postgres full-text + trigram search to start; pgvector
later for "funnels similar to this one."

---

## 5. Monetization without closing the library

The library stays **100% free and unwalled, permanently.** That's the promise, and
breaking it later kills the loops. Revenue comes from the layer underneath:

- **Workspace (primary).** Forking gives you a workspace. Free for one user and a
  handful of active funnels; paid for team seats, cloud sync, multi-device, and
  running your actual pipeline. This is where the legacy CRM code comes back —
  it's now the natural upgrade rather than the whole pitch.
- **AI adaptation credits.** "Rewrite this funnel for my ICP and offer" — a few free
  per month, then metered. High willingness to pay, directly attached to value.
- **Sponsored Stack placements.** Clearly labelled. Tool vendors want to be the
  default in high-traffic funnels. Never let this touch ranking or results.
- **Creator tips / paid deep-dives (optional, later).** Only if it never paywalls
  anything already public.

Order matters: don't build billing until the fork→signup rate proves the loop works.

---

## 6. The real risk: cold start

A community library with twelve playbooks is dead on arrival, and you only get one
launch. Plan for a **seeded, curated launch, not an open field**:

- **~120 playbooks live on day one**, spanning ~8 channels × ~10 ICPs so every browse
  path and every programmatic page has something real behind it.
- Written/assembled by you with AI assistance, then hand-edited. Budget this as
  actual work — roughly 3–4 weeks of part-time effort, running parallel to the build.
- **~30 invited creators** seeded before public launch, each with a profile and 1–3
  playbooks, ideally with real numbers. They become launch-day distribution.
- Only then open public submissions.

### Legal caution on seeding

Do not republish other companies' actual emails, ad copy, or landing pages verbatim
— that's someone else's copyrighted work and it's how these sites get taken down.
Write original templates, describe and *link to* the source when analysing a real
campaign, and require contributors to confirm they own what they submit. Structure
(timing, sequence, triggers, benchmarks) isn't copyrightable; the prose is.

### Quality collapse — now a launch-day concern

**Decision: publishing is open from day one.** Anyone can submit without an invite.
That's a real bet — it tests whether people actually contribute, which is the
question that decides whether this is a platform or a blog — but it moves every
defence from "later" to "before the first public link."

Because there's no invite gate holding the line, these ship *with* Phase 1:

- rate limits per account and per IP on publish
- `nofollow` on all outbound links until a reputation threshold is crossed
- mandatory affiliate disclosure, enforced at submit time
- report / flag on every object, with a visible queue you actually work
- lightweight review on a creator's **first** publish only — post-hoc for everything
  after, so contribution stays frictionless
- near-duplicate and AI-slop detection on submit (embedding similarity against the
  existing corpus)
- rights confirmation checkbox on every submission, plus a published takedown path

And the surfaces that keep slop off the front page:

- **default sort is quality, never recency** — a firehose homepage is how open
  libraries die
- a visible **Curated** badge and staff-picks rail, so the seeded corpus anchors the
  standard newcomers write toward
- objects with no Result attached rank below objects that have one

The seeded corpus matters *more* under open publishing, not less: it's the only thing
setting the quality bar for the first hundred contributors.

---

## 7. Technical plan

Carry forward what already worked in legacy; add only what the new shape demands.

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript | carried over |
| Styling | Tailwind v4 | carried over |
| DB | Neon Postgres + Prisma 7 | carried over, already deployed |
| Auth | better-auth — magic link + Google | new; legacy had none |
| Seed content | MDX + frontmatter in `content/`, compiled into DB | version-controlled launch corpus |
| Editor | Structured forms per object type, not a freeform editor | keeps data structured and quality high |
| Search | Postgres tsvector + pg_trgm → pgvector later | |
| OG images | `next/og`, edge, cached | critical path for virality |
| Rate limit | Upstash Redis | |
| Analytics | PostHog + Vercel Analytics | |
| Email | Resend | magic links + weekly digest |
| Media | Vercel Blob | |
| Deploy | Vercel | already configured |

### Data model sketch

```
User ──< Profile(handle, bio, links)
User ──< Workspace ──< ForkedFunnel   ← legacy CRM models re-attach here
Playbook ──< Funnel ──< Flow ──< Play
Result   → polymorphic(objectType, objectId, metric, value, sampleSize, period, proofTier)
Fork     → (userId, objectType, objectId, parentId)   ← attribution chain
Tag / Channel / ICP / Stack → many-to-many facets
```

Every object keeps `parentId`, so the remix lineage is queryable — "this funnel has
1,240 descendants" is both a ranking signal and a share hook.

### Design priority

Two components carry disproportionate weight and deserve real design time: the
**funnel diagram** and the **flow timeline**. They appear in-page, in OG cards, and in
every screenshot anyone posts. Everything else can be plain.

---

## 8. Phases

Dates assume a start of **Mon 10 Aug 2026**. Each phase is independently shippable.

Open publishing pulls auth and moderation forward, so Phase 1 is bigger than the
read-only version would have been — one launch instead of two.

**Phase 0 — Foundation (week 1, Aug 10–16)**
Scaffold, design system, data model, **auth**, seed pipeline, deploy skeleton.
*Exit:* an empty but deployed app; one seeded playbook renders end to end.

**Phase 1 — Library + open publishing (weeks 2–4, Aug 17–Sep 6)**
Read experience, browse/facets, search, all public routes, OG cards, funnel diagram
and flow timeline, copy-to-clipboard on every play. Structured publish flow, rights
confirmation, rate limits, report queue, first-publish review, quality-default
ranking, Curated badge.
*Exit:* **the public launch.** A stranger can read without an account and publish
with one.

**Phase 2 — Close the loops (week 5, Sep 7–13)**
Fork, save, collections, creator profiles, fork counts, Results capture,
leaderboards, weekly digest.
*Exit:* fork → signup works and is instrumented; contributors have a profile worth
promoting.

**Phase 3 — Trust at scale (week 6, Sep 14–20)**
Reputation thresholds, `dofollow` promotion, dedupe and slop detection tuned against
real submissions, moderation tooling, curation surfaces.
*Exit:* moderation load per new contributor is flat or falling.

**Phase 4 — The paid layer (weeks 7+, Sep 21 onward)**
Workspace/pipeline (legacy CRM code returns as the "run it" layer), AI adaptation,
embeds, free-tool wedge, billing.

Content seeding runs in parallel from week 1 and must be done before Phase 1 ships —
under open publishing the seed corpus *is* the quality bar, so it can't slip.

---

## 9. Instrument from day one

Vanity metrics will lie to you here. Track:

- unique views per object, and **share-clicks per view**
- **copy-play rate** (the strongest "this was useful" signal, needs no account)
- **fork rate**, and **fork → signup** conversion
- signup → first-published-object
- Results submitted per week
- 7-day and 30-day return rate
- % of traffic from organic vs. social vs. creator referral

Target for the loop to be self-sustaining: every 100 public views produce enough
forks and shares to generate more than 100 new views. If that ratio stays below 1
after Phase 2, the answer is better content and better share cards — not more
features.

---

## 10. Decisions

**Decided — 9 Aug 2026**

1. **Library first; the CRM returns in Phase 4** as the paid "run it" layer you
   graduate into after forking. Phase 1 ships without it.
2. **Open publishing from day one** — no invite gate. Consequences: auth moves into
   Phase 0, and the full anti-spam and curation stack ships with Phase 1 rather than
   later (§6). The bet is that open contribution is the thing worth testing early;
   the cost is that moderation is a launch requirement, not a follow-up.

**Still open**

3. Whether to keep the `aleadmate` name and the existing brand assets from legacy.
4. Where results-verification stops — screenshots only, or connected data sources
   (ESP/CRM read-only OAuth) for a real Verified tier. Affects Phase 2 scope.
5. Whether the seed corpus is authored solo or with 2–3 paid freelance writers, which
   is the main lever on whether Phase 1's date holds.
