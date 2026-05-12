# LeadMate

LeadMate is a browser-first lead manager for freelancers, founders, and small teams who want a clean follow-up system without CRM complexity.

The project has been migrated from a static MVP into a serious Next.js + TypeScript codebase with Prisma, Neon-ready Postgres configuration, Zod validation, local-first browser storage, and a path toward paid sync.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Prisma ORM
- Neon Postgres through `@neondatabase/serverless`
- Zod validation
- IndexedDB for local-first browser storage
- Papa Parse dependency reserved for CSV import/export
- OpenRouter/OpenAI-compatible AI endpoint scaffold
- Stripe checkout placeholder for the $5/month sync plan

## Project Structure

```text
src/app                 Next.js app routes and API routes
src/components          LeadMate React UI
src/lib                 local storage, Prisma, validation, samples, dates
src/types               shared LeadMate domain types
prisma/schema.prisma    Neon/Postgres data model
public/assets           product logos and app assets
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create env:

```bash
cp .env.example .env
```

Configure Neon:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
```

Push schema:

```bash
npm run db:push
```

Start dev server:

```bash
npm run dev
```

## Vercel Config

Use Vercel’s automatic Next.js preset:

- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave default

Environment variables needed on Vercel:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `OPENROUTER_API_KEY`, optional
- `OPENROUTER_MODEL`, optional
- `STRIPE_SECRET_KEY`, future billing
- `STRIPE_WEBHOOK_SECRET`, future billing
- `NEXT_PUBLIC_STRIPE_PRICE_ID_SYNC_MONTHLY`, future billing

## Product Notes

The current UI still supports local-first usage in the browser. Cloud sync, login, and billing are represented in the UI and backed by a Prisma-ready data model, but production auth and Stripe checkout should be wired next.

The $5/month plan should unlock cloud backup, multi-device sync, and account recovery while keeping the private local mode free.
