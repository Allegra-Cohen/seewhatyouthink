import { visit } from "unist-util-visit";

// Open external links in a new tab. rehype-external-links handles markdown
// `[text](url)` links; this remark plugin handles hand-written JSX <a> tags
// in MDX, which live as mdxJsxTextElement / mdxJsxFlowElement nodes and
// otherwise bypass rehype entirely.
export default function remarkExternalJsxLinks() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== "mdxJsxTextElement" && node.type !== "mdxJsxFlowElement") return;
      if (node.name !== "a") return;
      const attrs = node.attributes ?? [];
      const hrefAttr = attrs.find((a) => a.type === "mdxJsxAttribute" && a.name === "href");
      const href = typeof hrefAttr?.value === "string" ? hrefAttr.value : null;
      if (!href) return;
      if (href.startsWith("/") || href.startsWith("#")) return;
      if (!attrs.some((a) => a.name === "target")) {
        attrs.push({ type: "mdxJsxAttribute", name: "target", value: "_blank" });
      }
      if (!attrs.some((a) => a.name === "rel")) {
        attrs.push({ type: "mdxJsxAttribute", name: "rel", value: "noopener noreferrer" });
      }
      node.attributes = attrs;
    });
  };
}
