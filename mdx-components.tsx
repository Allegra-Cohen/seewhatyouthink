import type { MDXComponents } from "mdx/types";
import { Footnote } from "@/app/components/Footnote";
import { Reference } from "@/app/components/Reference";
import { Summary } from "@/app/components/Summary";
import ToggleImage from "@/app/components/ToggleImage";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Footnote,
    Reference,
    Summary,
    ToggleImage,
  };
}