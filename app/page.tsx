import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { LeftMargin } from "@/app/components/LeftMargin";
import { BackgroundDrawings } from "@/app/components/BackgroundDrawings";
import { SummaryLensProvider } from "@/app/components/SummaryLensProvider";
import { Summary } from "@/app/components/Summary";
import { EmailSignup } from "@/app/components/EmailSignup";
import { HoverBlob } from "@/app/components/HoverBlob";

export default function Home() {
  const posts = getAllPosts();

  return (
    <SummaryLensProvider>
      <BackgroundDrawings />
      <div
        className="relative grid grid-cols-[1fr_2fr_1fr] min-h-screen pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <LeftMargin />
        <main className="py-16 px-6 pointer-events-auto">
          <h1
            style={{
              fontFamily: "var(--font-lato)",
              marginTop: "clamp(2.5rem, 3vw, 4.5rem)",
            }}
            className="text-4xl font-bold mb-8"
          >
            Writing
          </h1>
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {post.summary ? (
                    <Summary note={post.summary}>
                      <h2 className="text-2xl font-semibold">{post.title}</h2>
                    </Summary>
                  ) : (
                    <h2 className="text-2xl font-semibold">{post.title}</h2>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </main>
          <div style={{marginTop: "8rem", marginLeft: "10rem", pointerEvents: "auto"}}>
          <HoverBlob color="#a53f2a" blobIndex={2} blobStyle={{ top: "-20%", left: "-10%", width: "90%", height: "80%" }}>
          <EmailSignup />
          </HoverBlob>
          </div>
          <div style={{ height: "10vw" }} />
        <div />
      </div>
    </SummaryLensProvider>
  );
}
