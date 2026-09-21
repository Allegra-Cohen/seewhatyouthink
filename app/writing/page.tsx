import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";
import { LeftMargin } from "@/app/components/LeftMargin";
import { Collage } from "@/app/components/Collage";
import { EmailSignup } from "@/app/components/EmailSignup";
import { AnalyticsNotice } from "@/app/components/AnalyticsNotice";

export const metadata = { title: "Writing", alternates: { canonical: "/writing" } };

/**
 * The list of posts. THIS USED TO BE `/`.
 *
 * It moved here when the landing page took the root URL: `/` is now the masthead and
 * the three ways in, and the writing is one of those three rather than the thing you
 * land on. The rubber plant in the collage points here; the eye points at `/`.
 *
 * NO `SummaryLensProvider`. That is the TL;DR lens — the button bottom-right, and the
 * summaries it revealed in the right margin on hover. Every summary on this page is now
 * printed under its own title, so the button had nothing left to reveal. Post pages keep
 * the lens: there it annotates prose as you read, which is a different job from labelling
 * a list.
 */
export default function Writing() {
  const posts = getAllPosts();

  return (
    <>
      <Collage />
      {/*
        `25% | rest | --right-col`, and every page with a subscribe module uses the same three.

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
          {/* The same shape as /field-guide: a ruled list of titles, each with a line of
              prose underneath saying what it is. The rules and the note styling are
              shared rules in globals.css (`.post-list` / `.post-row` / `.post-summary`,
              declared alongside their `.fg-remark*` twins) so the two lists cannot drift.

              The summary used to be the TL;DR lens — text hidden behind a button in the
              right margin that you had to switch on and then hover a title to see. It is
              a description of the post, so it is simply under the post now. The lens is
              gone from this page with it; post pages still have it, because there it
              annotates prose rather than a list.

              ONE CAVEAT ON THE COLOURS: they cycle by position, so on this list — which
              is newest-first — a new post at the top shifts every colour below it. On
              /field-guide, which only ever grows at the end, nothing moves. */}
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.slug} className="post-row">
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  <span className="flex items-baseline gap-3 flex-wrap">
                    <h2 className="text-2xl font-semibold">{post.title}</h2>
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
                {post.summary && <p className="post-summary">{post.summary}</p>}
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
      <AnalyticsNotice />
    </>
  );
}
