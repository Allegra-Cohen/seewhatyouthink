import type { Metadata } from "next";
import { getPost } from "@/lib/posts";
import { SITE_NAME, SITE_OG_IMAGE } from "@/lib/site";

/**
 * Per-post <head> tags: title, description, canonical URL and the link-preview card.
 *
 * Posts don't call this themselves — lib/remark-post-metadata.mjs injects
 * `export const metadata = postMetadata("<slug>")` into every app/posts/<slug>/page.mdx
 * at build time, so a new post gets it for free.
 *
 * Frontmatter used: `title`, `date`, optional `description` (falls back to `summary`),
 * and optional `image`
 * (a path under public/, e.g. "/demo-time/new_board_1.png"). With no `image`, the
 * preview falls back to the site-wide thumbnail in lib/site.ts.
 *
 * Next merges metadata shallowly, so `openGraph` here replaces the root layout's
 * `openGraph` entirely — which is why the fallback image is repeated rather than
 * inherited.
 */
export function postMetadata(slug: string): Metadata {
  const post = getPost(slug);
  if (!post) return {};

  const url = `/posts/${slug}`;
  const description = post.description || post.summary || undefined;
  const images = [post.image ? { url: post.image } : SITE_OG_IMAGE];

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: post.title,
      description,
      url,
      publishedTime: post.date || undefined,
      authors: ["Allegra A. Beal Cohen"],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: images.map((i) => i.url),
    },
  };
}
