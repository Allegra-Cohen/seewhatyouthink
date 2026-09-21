import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "app/posts");

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  /** Optional search/link-preview description; falls back to `summary`. */
  description?: string;
  /** Optional link-preview image, a path under public/. */
  image?: string;
};

export function getPost(slug: string): Post | null {
  const filePath = path.join(postsDirectory, slug, "page.mdx");

  // Skip anything that isn't a folder with a page.mdx inside
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");

  // gray-matter splits the frontmatter from the content
  const { data } = matter(fileContents);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    summary: data.summary ?? "",
    description: data.description,
    image: data.image,
  };
}

export function getAllPosts(): Post[] {
  // Get all folders inside app/posts/
  const slugs = fs.readdirSync(postsDirectory);

  const posts = slugs
    .map(getPost)
    .filter(Boolean) as Post[];

  // Sort newest first
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}