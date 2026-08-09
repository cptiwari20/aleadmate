# aLeadMate

**The open library of lead-gen playbooks that actually worked.**

Free to read. Free to copy. No login wall. Every guide, flow, and funnel is a live,
forkable object — not a PDF.

---

## Status

`main` is a clean slate. Planning is complete; implementation has not started.

- **Plan:** [`docs/PLAN.md`](docs/PLAN.md)
- **Previous codebase:** the local-first LeadMate CRM lives on the `legacy` branch
  (also `crm_legacy` on the remote). Nothing was deleted.

## What this is

Five primitives, everything else is built from them:

- **Play** — one atomic asset (an email, a DM opener, an ad hook)
- **Flow** — ordered Plays with timing, triggers, and branches
- **Funnel** — an end-to-end motion with stage benchmarks
- **Playbook** — the narrative guide for a specific ICP and channel
- **Result** — a dated, sample-sized outcome attached to any of the above

Results are the point. Swipe files are everywhere; swipe files with real, labelled
outcomes are not.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Prisma 7 · Neon Postgres · Vercel

See [`docs/PLAN.md`](docs/PLAN.md) for the full technical plan, phases, and open
decisions.
