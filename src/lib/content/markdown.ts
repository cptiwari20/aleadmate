import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * Sanitising is not optional here. The seed corpus is trusted, but the same
 * renderer serves public submissions from Phase 1, and retro-fitting sanitising
 * onto a live UGC surface is how you ship an XSS hole.
 */
const schema: typeof defaultSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ["rel", "nofollow", "ugc", "noopener", "noreferrer"],
      ["target", "_blank"],
    ],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
