/**
 * Verifies the database is reachable and the schema is actually applied.
 * `db push` succeeding is not the same as the app being able to read — this
 * checks the path the running app uses, through the Neon serverless adapter.
 */
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "\n✗ DATABASE_URL is not set.\n" +
        "  Copy .env.example to .env and paste your Neon connection strings.\n",
    );
    process.exit(1);
  }

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "(unparseable host)";
    }
  })();

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

  try {
    const started = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    console.log(`  ✓ connected to ${host} in ${Date.now() - started}ms`);

    const [waitlist, playbooks, users] = await Promise.all([
      prisma.waitlistSignup.count(),
      prisma.playbook.count(),
      prisma.user.count(),
    ]);

    console.log(`  ✓ schema applied`);
    console.log(
      `\n  waitlist signups: ${waitlist}\n  playbooks: ${playbooks}\n  users: ${users}\n`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n✗ ${message}\n`);
    if (/does not exist|relation|P2021/i.test(message)) {
      console.error("  The schema is not applied yet. Run: npm run db:push\n");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
