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
// their own. Each is a short note about one remark in the guide. They are data read at
// build time, not pages.
//
// The list they render into is THE GUIDE'S OWN LIST, reproduced: /field-guide shows the
// same remarks in the same order as the viewer's front door (`RemarkList.tsx`), oldest
// at the top. What the blog adds is the note under each title -- prose that exists only
// here, because it is about the remark rather than part of it.
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
const entriesDirectory = path.join(process.cwd(), "app/field-guide/entries");

const introFile = path.join(process.cwd(), "app/field-guide/intro.md");

// The viewer, and the names its `?open=` understands.
//
// `remarkSlugs.json` is written by hand in the FIELD GUIDE repo (`ui/src/`) and copied
// in here by export_guide.py, beside the payload. It maps name -> remark id, and the
// same file is compiled into the viewer's bundle — so a link built here and the lookup
// done there come from one source and cannot drift apart.
//
// WHY NAMES AT ALL: `?open=513523bd-2f86-4b73-90f2-5b72542e8cc7` is what a phishing link
// looks like. `?open=the-neurorights` says what it opens. The uuid form still works, so
// nothing already published goes dead.
//
// THE TRAILING SLASH IS LOAD-BEARING — see the note in page.tsx. It is part of VIEWER
// and the query goes after it.
const VIEWER = "/field-guide/read/";

const slugsFile = path.join(
  process.cwd(), "public", "field-guide", "read", "remarkSlugs.json");

/** Remark id -> name: `remarkSlugs.json` read backwards, since entries hold the id. */
function readRemarkNames(): Record<string, string> {
  if (!fs.existsSync(slugsFile)) return {};
  const byName: Record<string, string> = JSON.parse(fs.readFileSync(slugsFile, "utf8"));
  // Last one wins if a remark has two names. Keeping an old name alive beside a new one
  // is deliberate on the guide's side — both still resolve — but only one can be the
  // name NEW links use, and that is the later entry.
  return Object.fromEntries(Object.entries(byName).map(([name, id]) => [id, name]));
}

export type FieldGuideEntry = {
  slug: string;
  title: string;
  date: string;
  /** The id of the remark this note is about, from `remark:` in the frontmatter.
   *
   *  This is what makes the TITLE the way into the guide (`?open=<id>`), which is how
   *  the viewer's own list behaves. It replaced a link written by hand inside each
   *  note; those are gone, so a missing id means a title with no way in rather than a
   *  broken one -- hence null, and hence the page checking it. Ids come from the
   *  published payload, `read-graph.json`. */
  remark: string | null;
  /** Where the title links, or null when there is no `remark:` to link to.
   *
   *  Built here rather than in the page so the name lookup happens once, in the one
   *  place that already knows about `remarkSlugs.json`. */
  href: string | null;
  /** The entry body, already Markdown-rendered to HTML. */
  html: string;
};

// Same link behaviour as an MDX post: external links open in a new tab, internal
// ones (notably /field-guide/read/?open=<id> into the guide) are left alone,
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

  const remarkNames = readRemarkNames();

  const entries = fs
    .readdirSync(entriesDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const fileContents = fs.readFileSync(path.join(entriesDirectory, name), "utf8");
      const { data, content } = matter(fileContents);
      const slug = name.replace(/\.md$/, "");
      const remark = data.remark ? String(data.remark) : null;

      // THROWING HERE IS THE POINT. An unnamed remark doesn't break anything visibly —
      // the link would just carry a uuid, which works. So a forgotten name is invisible
      // at exactly the moment it could be fixed, and permanent once the post is out.
      // `next build` failing is the only thing that makes it a decision.
      //
      // The fix is one line in the field guide's ui/src/remarkSlugs.json, followed by a
      // rebuild and re-export — the name has to be in the bundle too, or the viewer
      // can't resolve it.
      if (remark && !remarkNames[remark]) {
        throw new Error(
          `field guide entry "${slug}" points at remark ${remark}, which has no name in `
          + `public/field-guide/read/remarkSlugs.json.\n`
          + `Add one in the field guide repo (ui/src/remarkSlugs.json), then rebuild the `
          + `viewer and re-run export_guide.py.`
        );
      }

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
        remark,
        // THE FOLDER FORM, not `?open=`. Each named remark has its own directory in the
        // published viewer, written by export_guide.py, carrying that remark's own `og:`
        // tags — and a link preview can only vary per FILE, since a crawler never runs
        // the JavaScript that would resolve a query string. `?open=` still works and the
        // viewer rewrites it to this form on arrival, but what this page hands out should
        // already be the address that previews.
        href: remark ? `${VIEWER}${remarkNames[remark]}/` : null,
        html: renderMarkdown(content),
      };
    });

  // OLDEST FIRST -- the opposite of getAllPosts(), and deliberately not matching it.
  // The guide is a thing you read from the beginning, so its list is ordered the way
  // `RemarkList.tsx` orders it, not the way a feed of posts is.
  //
  // Sorted on the FILE's date, not the remark's `updated_at`, even though the viewer
  // uses the latter. They disagree: editing a remark bumps `updated_at`, which silently
  // reorders the guide's own list, and two remarks edited the same day cannot be
  // separated by it at all. The file date is when the note was written and never moves.
  return entries.sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** The prose between the page heading and the list, as HTML.
 *
 *  Its own file rather than a paragraph in `page.tsx` so that changing the words is
 *  editing Markdown, not JSX. Empty string when the file is missing or blank, which the
 *  page renders as nothing at all -- there is no requirement that an intro exist. */
export function getFieldGuideIntro(): string {
  if (!fs.existsSync(introFile)) return "";
  const { content } = matter(fs.readFileSync(introFile, "utf8"));
  return content.trim() ? renderMarkdown(content) : "";
}
