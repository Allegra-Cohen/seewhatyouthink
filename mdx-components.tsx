/* eslint-disable @next/next/no-img-element */
// Markdown image syntax (![alt](url)) doesn't carry width/height, which
// Next's <Image> requires, so we render a plain <img>. Posts that want
// optimization can use <Image> from next/image directly.
import type { MDXComponents } from "mdx/types";
import type { AnchorHTMLAttributes, ImgHTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { Footnote } from "@/app/components/Footnote";
import { Reference } from "@/app/components/Reference";
import { Summary } from "@/app/components/Summary";
import ToggleImage from "@/app/components/ToggleImage";
import { PostDate } from "@/app/components/PostDate";
import { DecisionTree, Option, Outcome, OutcomeText, Question, Tail } from "@/app/components/DecisionTree";

function Img(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      alt={props.alt ?? ""}
      style={{
        display: "block",
        margin: "2.5rem auto",
        maxWidth: "100%",
        height: "auto",
        ...props.style,
      }}
    />
  );
}

function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      {...props}
      style={{
        borderCollapse: "collapse",
        margin: "2rem auto",
        ...props.style,
      }}
    />
  );
}

function Th(props: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      style={{
        border: "1px solid var(--foreground)",
        padding: "0.5rem 0.75rem",
        textAlign: "left",
        maxWidth: "40rem",
        overflowWrap: "break-word",
        ...props.style,
      }}
    />
  );
}

function Td(props: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...props}
      style={{
        border: "1px solid var(--foreground)",
        padding: "0.5rem 0.75rem",
        maxWidth: "40rem",
        overflowWrap: "break-word",
        ...props.style,
      }}
    />
  );
}

function Anchor({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = !href || href.startsWith("/") || href.startsWith("#");
  if (isInternal) {
    return <a href={href} {...rest}>{children}</a>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    img: Img,
    a: Anchor,
    table: Table,
    th: Th,
    td: Td,
    Footnote,
    Reference,
    Summary,
    ToggleImage,
    PostDate,
    DecisionTree,
    Option,
    Outcome,
    OutcomeText,
    Question,
    Tail,
  };
}