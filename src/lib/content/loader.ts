import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { readingMinutes, renderMarkdown } from "@/lib/content/markdown";
import { playbookFrontmatterSchema, type Playbook } from "@/lib/content/schema";

const CONTENT_DIR = path.join(process.cwd(), "content", "playbooks");

export class ContentError extends Error {
  constructor(
    readonly file: string,
    message: string,
  ) {
    super(`${file}: ${message}`);
    this.name = "ContentError";
  }
}

async function listFiles(): Promise<string[]> {
  try {
    const entries = await readdir(CONTENT_DIR);
    return entries.filter((f) => f.endsWith(".md")).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function parseFile(file: string): Promise<Playbook> {
  const raw = await readFile(path.join(CONTENT_DIR, file), "utf8");
  const { data, content } = matter(raw);

  const parsed = playbookFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  · ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new ContentError(file, `invalid frontmatter\n${issues}`);
  }

  const expectedSlug = path.basename(file, ".md");
  if (parsed.data.slug !== expectedSlug) {
    throw new ContentError(
      file,
      `slug "${parsed.data.slug}" must match the filename "${expectedSlug}.md"`,
    );
  }

  if (content.trim().length < 200) {
    throw new ContentError(file, "body is too short to be a useful playbook");
  }

  return {
    ...parsed.data,
    bodyHtml: await renderMarkdown(content),
    readingMinutes: readingMinutes(content),
  };
}

/**
 * Phase 0 reads the version-controlled corpus straight off disk. Phase 1 swaps
 * this for the database once submissions exist; everything downstream talks to
 * this module, not to the filesystem, so that swap stays contained here.
 */
let cache: Promise<Playbook[]> | null = null;

export function loadPlaybooks(): Promise<Playbook[]> {
  if (!cache || process.env.NODE_ENV === "development") {
    cache = (async () => {
      const files = await listFiles();
      const playbooks = await Promise.all(files.map(parseFile));

      const slugs = new Set<string>();
      for (const playbook of playbooks) {
        if (slugs.has(playbook.slug)) {
          throw new Error(`duplicate playbook slug: ${playbook.slug}`);
        }
        slugs.add(playbook.slug);
      }

      return playbooks;
    })();
  }
  return cache;
}

export async function getPlaybook(slug: string): Promise<Playbook | null> {
  const playbooks = await loadPlaybooks();
  return playbooks.find((p) => p.slug === slug) ?? null;
}

export async function getPlaybookSlugs(): Promise<string[]> {
  return (await loadPlaybooks()).map((p) => p.slug);
}

/**
 * Default ordering across the whole site: quality first, never recency.
 * A firehose front page is how open libraries die, so the sort is centralised
 * here rather than left to each surface.
 */
export function rankPlaybooks(playbooks: Playbook[]): Playbook[] {
  const score = (p: Playbook) => {
    const best = p.results.reduce((acc, r) => {
      const tier = r.proofTier === "verified" ? 3 : r.proofTier === "community" ? 2 : 1;
      return Math.max(acc, tier);
    }, 0);
    return best * 10 + (p.curated ? 5 : 0) + Math.min(p.results.length, 3);
  };

  return [...playbooks].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}
