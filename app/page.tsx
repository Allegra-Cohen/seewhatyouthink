import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";
import { LeftMargin } from "@/app/components/LeftMargin";
import { Collage } from "@/app/components/Collage";
import { SummaryLensProvider } from "@/app/components/SummaryLensProvider";
import { Summary } from "@/app/components/Summary";
import { EmailSignup } from "@/app/components/EmailSignup";

export default function Home() {
  const posts = getAllPosts();

  return (
    <SummaryLensProvider>
      <Collage />
      {/*
        `25% | rest | 20rem`, and every page with a subscribe module uses the same three.

        - Column 1 is `25%`, not `1fr`: it is the space the collage's navigation
          drawings occupy, and Collage.tsx's clearance invariant depends on the text
          starting at exactly 25vw. A `1fr` here gets squeezed by the other columns'
          minimums and slides the drawings under the text.
        - Column 3 is a fixed `--right-col` (globals.css), which the margin notes read
          too — they overlay this column without being in it. It used to be `1fr`,
          which on a big monitor grew far wider than the form needs while `lg:ml-40`
          pushed the form rightward inside it, so shrinking to a laptop cut the email
          field off. A fixed column sized for its contents cannot do that at any width.
        - Column 2 therefore takes all the remaining width, so the prose reaches much
          farther right than the old `2fr` share allowed.
      */}
      <div
        className="relative grid grid-cols-1 lg:grid-cols-[25%_minmax(0,1fr)_var(--right-col)] min-h-screen pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <LeftMargin />
        <main className="py-8 px-6 lg:py-16 pointer-events-auto">
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
                  <span className="flex items-baseline gap-3 flex-wrap">
                    {post.summary ? (
                      <Summary note={post.summary}>
                        <h2 className="text-2xl font-semibold">{post.title}</h2>
                      </Summary>
                    ) : (
                      <h2 className="text-2xl font-semibold">{post.title}</h2>
                    )}
                    {post.date && (
                      <span
                        style={{
                          color: "var(--accent-secondary)",
                          fontSize: "clamp(10pt, 0.85vw, 13pt)",
                          fontFamily: "var(--font-lato)",
                        }}
                      >
                        {formatDate(post.date)}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </main>
          <div className="self-start lg:mt-32 mt-8 mx-auto lg:mx-0 w-1/2 lg:w-auto lg:pr-6 pointer-events-auto">
          <EmailSignup />
          </div>
          <div style={{ height: "10vw" }} />
        <div />
      </div>
    </SummaryLensProvider>
  );
}
