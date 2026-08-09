# aLeadMate

**The open library of lead-gen playbooks that actually worked.**

Free to read. Free to copy. No login wall. Every guide, flow, and funnel is a live,
forkable object — not a PDF.

---

## Status

**Phase 0 complete.** The app builds, deploys, and renders a seeded playbook end to
end. Auth and the data model are in place ahead of Phase 1, because publishing is
open from day one and there is no read-only window to hide behind.

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
or submissions.

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
| `DATABASE_URL` | Accounts, forks, submissions |
| `DIRECT_DATABASE_URL` | `db push` and migrations |
| `BETTER_AUTH_SECRET` | Auth (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `RESEND_API_KEY` | Magic-link delivery — logged to the console without it |
| `NEXT_PUBLIC_APP_URL` | Canonical URLs and OG images |

See [`docs/PLAN.md`](docs/PLAN.md) for the phases, viral loops, and open decisions.
