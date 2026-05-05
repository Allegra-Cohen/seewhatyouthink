import { formatDate } from "@/lib/posts";

export function PostDate({ date }: { date: string }) {
  return (
    <p style={{ marginTop: "-0.5rem", marginBottom: "1.5rem", opacity: 0.7 }}>
      {formatDate(date)}
    </p>
  );
}
