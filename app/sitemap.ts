import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getFieldGuideEntries } from "@/lib/field-guide";
import { SITE_URL } from "@/lib/site";

// Built once into out/sitemap.xml (required for `output: "export"`).
export const dynamic = "force-static";

/** Every page search engines should know about. New posts are picked up automatically. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/writing", "/field-guide", "/field-guide/read/", "/about"].map((p) => ({
    url: `${SITE_URL}${p}`,
  }));
  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: post.date || undefined,
  }));
  // Each remark in the guide has its own page (and preview card) under /field-guide/read/.
  const remarks = getFieldGuideEntries()
    .filter((e) => e.href)
    .map((e) => ({ url: `${SITE_URL}${e.href}` }));
  return [...pages, ...posts, ...remarks];
}
