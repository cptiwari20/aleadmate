/**
 * Compiles the version-controlled corpus in content/playbooks into Postgres.
 *
 * The markdown files stay the source of truth for seeded content: they review
 * like code, and re-running this is always safe because everything keys off the
 * playbook slug.
 */
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, PlayKind, ProofTier, PublishStatus, ResultUnit } from "@prisma/client";
import { loadPlaybooks } from "../src/lib/content/loader.js";
import type { Playbook } from "../src/lib/content/schema.js";

const SEED_USER_ID = "seed-aleadmate";

const playKinds: Record<string, PlayKind> = {
  email: PlayKind.EMAIL,
  dm: PlayKind.DM,
  "call-script": PlayKind.CALL_SCRIPT,
  ad: PlayKind.AD,
  "landing-copy": PlayKind.LANDING_COPY,
  objection: PlayKind.OBJECTION,
  post: PlayKind.POST,
};

const proofTiers: Record<string, ProofTier> = {
  unverified: ProofTier.UNVERIFIED,
  community: ProofTier.COMMUNITY,
  verified: ProofTier.VERIFIED,
};

const resultUnits: Record<string, ResultUnit> = {
  percent: ResultUnit.PERCENT,
  count: ResultUnit.COUNT,
  currency: ResultUnit.CURRENCY,
  ratio: ResultUnit.RATIO,
  days: ResultUnit.DAYS,
};

async function seedPlaybook(prisma: PrismaClient, playbook: Playbook) {
  const author = playbook.author;
  const userId = `${SEED_USER_ID}-${author.handle}`;

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      name: author.name,
      email: `${author.handle}@seed.aleadmate.local`,
      emailVerified: true,
    },
    update: { name: author.name },
  });

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      handle: author.handle,
      bio: author.bio,
      url: author.url,
      // Seeded curators are the quality anchor, so they start trusted.
      reviewed: true,
      dofollow: true,
      reputation: 100,
    },
    update: { bio: author.bio, url: author.url },
  });

  // Replacing children wholesale keeps re-seeds idempotent without diffing
  // every nested row; cascades handle stages, steps, and plays.
  await prisma.playbook.deleteMany({ where: { slug: playbook.slug } });

  const created = await prisma.playbook.create({
    data: {
      slug: playbook.slug,
      title: playbook.title,
      summary: playbook.summary,
      channel: playbook.channel,
      icps: playbook.icps,
      motion: playbook.motion,
      difficulty: playbook.difficulty,
      stack: playbook.stack,
      timeToFirstLead: playbook.timeToFirstLead,
      costToRun: playbook.costToRun,
      bodyMarkdown: "",
      bodyHtml: playbook.bodyHtml,
      authorId: userId,
      status: PublishStatus.PUBLISHED,
      curated: playbook.curated,
      rightsConfirmed: playbook.rightsConfirmed,
      affiliateDisclosure: playbook.affiliateDisclosure,
      publishedAt: new Date(playbook.publishedAt),
    },
  });

  const flowIdBySlug = new Map<string, string>();

  for (const [position, flow] of playbook.flows.entries()) {
    const createdFlow = await prisma.flow.create({
      data: {
        playbookId: created.id,
        slug: flow.slug,
        name: flow.name,
        goal: flow.goal,
        exitCriteria: flow.exitCriteria,
        position,
      },
    });
    flowIdBySlug.set(flow.slug, createdFlow.id);

    for (const [stepPosition, step] of flow.steps.entries()) {
      const play = await prisma.play.create({
        data: {
          slug: step.play.slug,
          kind: playKinds[step.play.kind],
          name: step.play.name,
          hook: step.play.hook,
          body: step.play.body,
          rationale: step.play.rationale,
          variables: step.play.variables,
        },
      });

      await prisma.flowStep.create({
        data: {
          flowId: createdFlow.id,
          day: step.day,
          condition: step.condition,
          channel: step.channel,
          position: stepPosition,
          playId: play.id,
        },
      });
    }
  }

  const funnel = await prisma.funnel.create({
    data: {
      playbookId: created.id,
      slug: playbook.funnel.slug,
      name: playbook.funnel.name,
    },
  });

  for (const [position, stage] of playbook.funnel.stages.entries()) {
    await prisma.funnelStage.create({
      data: {
        funnelId: funnel.id,
        key: stage.key,
        label: stage.label,
        description: stage.description,
        benchmarkLabel: stage.benchmarkLabel,
        benchmarkValue: stage.benchmarkValue,
        flowId: stage.flowSlug ? flowIdBySlug.get(stage.flowSlug) : undefined,
        position,
      },
    });
  }

  for (const result of playbook.results) {
    await prisma.result.create({
      data: {
        playbookId: created.id,
        label: result.label,
        value: result.value,
        unit: resultUnits[result.unit],
        currency: result.currency,
        sampleSize: result.sampleSize,
        period: result.period,
        proofTier: proofTiers[result.proofTier],
        proofUrl: result.proofUrl,
        note: result.note,
      },
    });
  }

  return created;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "\n✗ DATABASE_URL is not set.\n" +
        "  Copy .env.example to .env and point it at a Neon database, then run:\n" +
        "    npm run db:push && npm run content:seed\n",
    );
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

  try {
    const playbooks = await loadPlaybooks();
    for (const playbook of playbooks) {
      await seedPlaybook(prisma, playbook);
      console.log(`  ✓ seeded ${playbook.slug}`);
    }
    console.log(`\n${playbooks.length} playbook(s) seeded.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
