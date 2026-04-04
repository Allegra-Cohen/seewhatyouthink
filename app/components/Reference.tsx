import { MarginNote } from "./MarginNote";
import { getReference } from "@/lib/references";

export function Reference({ children, id }: { children?: React.ReactNode; id?: string }) {
  const content = children ?? (id ? getReference(id) : null);
  return <MarginNote variant="reference" id={id}>{content}</MarginNote>;
}
