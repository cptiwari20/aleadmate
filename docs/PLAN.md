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

### Quality collapse

The second this ranks, it attracts affiliate spam and AI slop. Defences from Phase 3:
human review on a creator's first publish, rate limits, mandatory affiliate
disclosure, report/downvote, `nofollow` on outbound links until reputation threshold,
and a visible curation standard.

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

**Phase 0 — Foundation (week 1, Aug 10–16)**
Scaffold, design system, data model, auth, seed pipeline, deploy skeleton.
*Exit:* an empty but deployed app, one seeded playbook renders end to end.

**Phase 1 — The public library (weeks 2–3, Aug 17–30)**
Read experience, browse/facets, search, all public routes, OG cards, funnel diagram
and flow timeline, copy-to-clipboard on every play. No accounts.
*Exit:* **launchable on its own.** Shareable from day one, before any login exists.

**Phase 2 — Close the loop (week 4, Aug 31–Sep 6)**
Auth, fork, save, collections, creator profiles, fork counts.
*Exit:* fork → signup → workspace works; instrument the conversion rate.

**Phase 3 — Open it up (weeks 5–6, Sep 7–20)**
Contributor publishing, submission + review queue, Results capture, leaderboards,
weekly digest, moderation and anti-spam.
*Exit:* someone who isn't you can publish something good.

**Phase 4 — The paid layer (weeks 7+)**
Workspace/pipeline (legacy code returns), AI adaptation, embeds, free-tool wedge,
billing.

Content seeding runs in parallel from week 1 and must be done before Phase 1 ships.

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

## 10. Open decisions

1. **Does the CRM/pipeline layer come back at all**, or does aLeadMate become purely
   a content and playbook platform with no execution surface?
2. **Curated-first vs. open-from-day-one** publishing.
3. Whether to keep the `aleadmate` name and the existing brand assets from legacy.
