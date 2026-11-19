# aLeadMate

**An AI SDR that finds your leads and runs the outreach.**

`/` is the early-access waitlist landing page. The open playbook library lives on
under `/library` and is unchanged.

---

## Status

**Waitlist landing page live** at `/`, capturing signups in two steps.

**Phase 0 of the playbook library complete** — builds, deploys, and renders a seeded
playbook end to end. Auth and the data model are in place ahead of Phase 1, because
publishing is open from day one and there is no read-only window to hide behind.

- **Plan:** [`docs/PLAN.md`](docs/PLAN.md)
- **Previous codebase:** the local-first LeadMate CRM lives on the `legacy` branch
  (also `crm_legacy` on the remote). Nothing was deleted.

## Quick start

```bash
npm install
```

```bash
npm run dev
```

The public library renders from version-controlled markdown in `content/playbooks/`
and needs **no database**. A `.env` is only required once you touch accounts, forks,
submissions, or waitlist signups.

## Waitlist

The landing page at `/` captures signups in two steps:

1. **Contact** — name, email, phone. Saved on its own, so someone who abandons the
   second step is still a captured lead rather than a lost one.
2. **Qualification** — lead types, location, business, budget per lead, and leads per
   month. Enriches the row created by step 1 via an unguessable token; the database
   id is never exposed to the browser.

Protections: a Zod schema on both steps, an off-screen honeypot, a per-instance rate
limit, and an upsert on email so a repeat signup updates rather than erroring.

> **Before launch:** set `DATABASE_URL`. Without it, signups fall back to a gitignored
> `.waitlist-local.jsonl` in development, and in production the action **fails loudly
> rather than faking success** — a landing page that pretends to capture is worse than
> one that is down. The rate limit is in-memory and per-instance; move it to a shared
> store (Upstash) before you send real traffic.

### Reading the signups

`/admin/waitlist` lists every signup with totals, step-2 completion rate, and a CSV
download. It needs two things:

1. `ADMIN_EMAILS` — a comma-separated allowlist. It is an env var rather than a
   database role because only someone who can deploy should be able to grant access.
2. A signed-in session. Sign in at `/signin` with a magic link; without
   `RESEND_API_KEY` the link is printed to the dev server console.

The CSV export quotes every field and neutralises leading `=`, `+`, `-` and `@`, so a
signup cannot smuggle a spreadsheet formula into whoever opens the export.

## Connecting Neon

1. Create a project at [neon.tech](https://neon.tech) and copy both connection
   strings — the **pooled** one and the **direct** one.
2. `cp .env.example .env`, then set `DATABASE_URL` (pooled) and
   `DIRECT_DATABASE_URL` (direct).
3. Create the tables and verify:

```bash
npm run db:push && npm run db:check
```

`db:push` is schema-only and safe to re-run. On Vercel, set the same variables in
the project's environment settings.

## Content model

Five primitives; everything on the site is one of them:

| Object | What it is |
|---|---|
| **Play** | One atomic asset — an email, a DM opener, an ad hook |
| **Flow** | Ordered Plays with timing, triggers, and branches |
| **Funnel** | An end-to-end motion with stage benchmarks |
| **Playbook** | The narrative guide for one ICP and channel |
| **Result** | A dated, sample-sized outcome attached to any of the above |

Results are the point. Swipe files are everywhere; swipe files with real, labelled
outcomes are not. Every result carries a **proof tier** — self-reported, community
signal, or verified — and those are never blurred together.

### Adding a playbook

Drop a markdown file into `content/playbooks/<slug>.md`. The filename must match the
`slug` in the frontmatter. Then:

```bash
npm run content:check
```

That validates every file against the same schema the public submission form will
use in Phase 1 — malformed frontmatter fails the build rather than the page.

## Database

Only needed for accounts, forks, and submissions. Copy the example env and point it
at a Neon Postgres database:

```bash
cp .env.example .env
```

```bash
npm run db:push && npm run content:seed
```

`content:seed` compiles the markdown corpus into Postgres. It keys off the playbook
slug, so re-running it is always safe.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Prisma generate + production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run content:check` | Validate the seed corpus |
| `npm run content:seed` | Compile the corpus into Postgres |
| `npm run db:push` | Push the Prisma schema |
| `npm run db:studio` | Prisma Studio |

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Prisma 7 · Neon Postgres ·
better-auth · Vercel

## Environment

Everything is optional in Phase 0 except what you actually use.

| Variable | Needed for |
|---|---|
| `DATABASE_URL` | Waitlist signups, accounts, forks, submissions |
| `DIRECT_DATABASE_URL` | `db push` and migrations |
| `BETTER_AUTH_SECRET` | Auth (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `RESEND_API_KEY` | Magic-link delivery — logged to the console without it |
| `ADMIN_EMAILS` | Access to `/admin/waitlist` |
| `NEXT_PUBLIC_APP_URL` | Canonical URLs and OG images |

See [`docs/PLAN.md`](docs/PLAN.md) for the phases, viral loops, and open decisions.
