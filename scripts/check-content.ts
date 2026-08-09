/**
 * Validates every file in content/playbooks against the publishing schema.
 * Runs in CI so a malformed seed file fails the build rather than the page.
 */
import { loadPlaybooks } from "../src/lib/content/loader.js";

async function main() {
  const playbooks = await loadPlaybooks();

  if (playbooks.length === 0) {
    console.warn("No playbooks found in content/playbooks/.");
    return;
  }

  let resultCount = 0;
  let withoutResults = 0;

  for (const playbook of playbooks) {
    resultCount += playbook.results.length;
    if (playbook.results.length === 0) withoutResults += 1;

    const steps = playbook.flows.reduce((n, f) => n + f.steps.length, 0);
    console.log(
      `  ✓ ${playbook.slug}  ` +
        `${playbook.funnel.stages.length} stages · ${playbook.flows.length} flows · ` +
        `${steps} plays · ${playbook.results.length} results`,
    );
  }

  console.log(
    `\n${playbooks.length} playbook(s), ${resultCount} result(s).` +
      (withoutResults > 0
        ? ` ${withoutResults} without results — these rank below the rest.`
        : ""),
  );
}

main().catch((error) => {
  console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
