import { getFieldGuideEntries, getFieldGuideIntro } from "@/lib/field-guide";
import { LeftMargin } from "@/app/components/LeftMargin";
import { Collage } from "@/app/components/Collage";
import { EmailSignup } from "@/app/components/EmailSignup";
import { AnalyticsNotice } from "@/app/components/AnalyticsNotice";
import { SITE_NAME, SITE_OG_IMAGE } from "@/lib/site";

const TITLE = "Field Guide to Thinking for Ourselves in the Age of AI";
const DESCRIPTION =
  "Underneath fears about rogue AI, labor market collapse and gradual disempowerment, there's a deeper worry: As machines become more capable, will humans be able to keep thinking for ourselves? It's a complicated question, but the Field Guide to Thinking for Ourselves has answers. 100% human-written, on topics from education to collective intelligence.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/field-guide" },
  // Replaces the root layout's card entirely (Next merges shallowly), so the image is repeated.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: "/field-guide",
    images: [SITE_OG_IMAGE],
  },
};

export default function FieldGuidesPage() {
  const entries = getFieldGuideEntries();
  const intro = getFieldGuideIntro();

  return (
    <>
      <Collage />
      <div
        className="relative grid grid-cols-1 lg:grid-cols-[25%_minmax(0,1fr)_var(--right-col)] min-h-screen pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <LeftMargin />
        <main className="py-8 px-6 lg:py-16 lg:pr-12 pointer-events-auto">
          <h1
            style={{
              fontFamily: "var(--font-lato)",
              marginTop: "clamp(2.5rem, 3vw, 4.5rem)",
            }}
            className="text-4xl font-bold mb-8"
          >
            The Field Guide to Thinking for Ourselves in the Age of AI
          </h1>

          {/*
            The intro, and every note below it, is Markdown the curator wrote, rendered
            to HTML at build time by lib/field-guide.ts. First-party content in a
            statically exported site — there is no user input anywhere near it.
          */}
          {intro && (
            <div
              className="fg-intro"
              dangerouslySetInnerHTML={{ __html: intro }}
            />
          )}

          {/*
            THE GUIDE'S OWN LIST, reproduced. Same remarks, same order (oldest first,
            like RemarkList.tsx), title-as-link like the viewer's own rows. What the blog
            adds is the note underneath. Dates are deliberately absent: the order carries
            the chronology, which is the choice the viewer already made.
          */}
          {entries.length === 0 ? (
            <p style={{ color: "var(--accent-secondary)" }}>
              Nothing logged yet.
            </p>
          ) : (
            <ul className="fg-remark-list">
              {entries.map((entry) => (
                <li key={entry.slug} className="fg-remark">
                  {/*
                    A PLAIN ANCHOR, deliberately, and not next/link.
                    /field-guide/read/ is a directory of static files in public/, not a
                    Next route: it is the Vite build of the viewer, copied in by
                    export_guide.py. next/link would hand the path to the client router,
                    which has no such route in its manifest. An <a> forces a real document
                    load, which is what actually fetches index.html.

                    The trailing slash matters for the same reason the viewer's api.ts
                    resolves read-graph.json against import.meta.env.BASE_URL: landing on
                    .../fgttfo without it resolves relative URLs one level too high. It is
                    written here, before the query string, and must stay there.

                    No `remark:` in the frontmatter means a title with no way in, rather
                    than a link to ?open=null. See FieldGuideEntry.remark.

                    The href is built in lib/field-guide.ts, because it now carries the
                    remark's NAME rather than its uuid (`?open=the-neurorights`) and the
                    name lookup belongs where the entry is read.
                  */}
                  <h2 className="fg-remark-title">
                    {entry.href ? (
                      <a
                        className="fg-remark-link"
                        href={entry.href}
                      >
                        {entry.title}
                      </a>
                    ) : (
                      entry.title
                    )}
                  </h2>
                  <div
                    className="fg-remark-note"
                    dangerouslySetInnerHTML={{ __html: entry.html }}
                  />
                </li>
              ))}
            </ul>
          )}
        </main>
        {/*
          The third grid column, exactly as on the home page and on posts — same
          wrapper classes — so they don't drift into three slightly different
          subscribe modules. Only the label differs, and it differs as a PROP, not as
          a copy of the component.

          Both post to the same Google Form: subscribing here joins the one list, it
          does not create a field-guide-only list.
        */}
        <div className="self-start lg:mt-32 mt-8 mx-auto lg:mx-0 w-1/2 lg:w-auto lg:pr-6 pointer-events-auto">
          <EmailSignup label="Get notified about new entries" />
        </div>
        <div style={{ height: "10vw" }} />
      </div>
      <AnalyticsNotice />
    </>
  );
}
