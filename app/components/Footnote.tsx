import { MarginNote } from "./MarginNote";

export function Footnote({ children }: { children: React.ReactNode }) {
  return <MarginNote variant="footnote">{children}</MarginNote>;
}
