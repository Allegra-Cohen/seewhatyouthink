import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";

// Field guide entries are a RUNNING LIST, not posts: no per-entry route, no page of
// their own. Each is a short note about what changed in the guide, rendered as a
// card on /field-guides. They are data read at build time, not pages.
//
// They sit beside the page that renders them. That is colocation, which the App
// Router supports on purpose: only page.*, layout.* and route.* are special, so a
// file named the-cognitives.md is never a route no matter what pageExtensions says.
// Contrast app/posts/<slug>/page.mdx, which lives under app/ for the opposite
// reason — each of those IS a page, and moving it deletes its URL.
//
// Entries are also structurally invisible to the home page: getAllPosts() reads
// app/posts/ and only app/posts/, so an entry cannot leak into Writing by being
// mis-tagged. That is the reason the plan chose location over a frontmatter flag.
const entriesDirectory = path.join(process.cwd(), "app/field-guides/entries");

export type FieldGuideEntry = {
  slug: string;
  title: string;
  date: string;
  /** The entry body, already Markdown-rendered to HTML. */
  html: string;
};

// Same link behaviour as an MDX post: external links open in a new tab, internal
// ones (notably /field-guides/fgttfo/?open=<id> into the guide) are left alone,
// because rehype-external-links only matches hrefs that have a host.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] })
  .use(rehypeStringify);

function renderMarkdown(body: string): string {
  return String(processor.processSync(body));
}

export function getFieldGuideEntries(): FieldGuideEntry[] {
  // The directory is allowed not to exist — there is no requirement that the guide
  // ever have entries, and readdirSync throws ENOENT rather than returning []. The
  // page has to render at zero either way, so this is the normal case, not a guard
  // against a mistake.
  if (!fs.existsSync(entriesDirectory)) return [];

  const entries = fs
    .readdirSync(entriesDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const fileContents = fs.readFileSync(path.join(entriesDirectory, name), "utf8");
      const { data, content } = matter(fileContents);
      const slug = name.replace(/\.md$/, "");

      return {
        slug,
        title: data.title ?? slug,
        // Dates are read straight back out as written. gray-matter's YAML parser
        // turns an unquoted 2026-08-07 into a JS Date, which toString()s to a local
        // -- and therefore timezone-shifted -- value; formatDate() wants the plain
        // ISO string that app/posts frontmatter also uses.
        date: data.date instanceof Date
          ? data.date.toISOString().slice(0, 10)
          : String(data.date ?? ""),
        html: renderMarkdown(content),
      };
    });

  // Newest first, matching getAllPosts().
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}
