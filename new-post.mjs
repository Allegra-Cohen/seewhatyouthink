import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const title = process.argv[2];

if (!title) {
  console.error("Please provide a post title: node new-post.mjs 'My Post Title'");
  process.exit(1);
}

// Convert title to a URL-friendly slug
// e.g. "My Post Title" becomes "my-post-title"
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const date = new Date().toISOString().split("T")[0]; // e.g. 2026-04-03

const content = `---
title: "${title}"
date: "${date}"
---

# ${title}

Write your post here.
`;

const dir = join("app", "posts", slug);

await mkdir(dir, { recursive: true });
await writeFile(join(dir, "page.mdx"), content);

console.log(`Created new post at app/posts/${slug}/page.mdx`);