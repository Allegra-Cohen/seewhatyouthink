import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "node:path";

const externalJsxLinksPlugin = path.resolve(
  process.cwd(),
  "lib/remark-external-jsx-links.mjs",
);

const withMDX = createMDX({
  options: {
    // Plugins must be string module paths so Turbopack can serialize them.
    // remark-external-jsx-links is a local plugin that adds target="_blank"
    // to hand-written JSX <a> tags in MDX (rehype-external-links only
    // handles markdown-style links, which become hast anchor nodes).
    remarkPlugins: [
      ["remark-gfm"],
      ["remark-frontmatter"],
      [externalJsxLinksPlugin],
    ],
    rehypePlugins: [
      [
        "rehype-external-links",
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
    ],
  },
});

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  pageExtensions: ["ts","tsx","md","mdx"],
};

export default withMDX(nextConfig);
