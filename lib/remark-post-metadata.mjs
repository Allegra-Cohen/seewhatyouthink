import path from "node:path";
import { parse } from "acorn";

// Give every post its own <title>, description and link-preview card. For
// app/posts/<slug>/page.mdx this injects
//   import { postMetadata } from "@/lib/post-metadata";
//   export const metadata = postMetadata("<slug>");
// which reads the post's frontmatter at build time (see lib/post-metadata.ts).
// A post that writes its own `export const metadata` is left alone.
export default function remarkPostMetadata() {
  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0];
    if (!filePath) return;
    const parts = filePath.split(path.sep);
    const i = parts.lastIndexOf("posts");
    if (i < 1 || parts[i - 1] !== "app" || parts.length !== i + 3 || parts[i + 2] !== "page.mdx") return;
    const slug = parts[i + 1];

    const hasOwn = tree.children.some(
      (n) => n.type === "mdxjsEsm" && /export\s+(const|let|var|function)\s+(metadata|generateMetadata)\b/.test(n.value),
    );
    if (hasOwn) return;

    const value =
      `import { postMetadata } from "@/lib/post-metadata";\n` +
      `export const metadata = postMetadata(${JSON.stringify(slug)});`;
    tree.children.unshift({
      type: "mdxjsEsm",
      value,
      data: { estree: parse(value, { ecmaVersion: "latest", sourceType: "module" }) },
    });
  };
}
