import { getFieldGuideEntries } from "@/lib/field-guides";
import { formatDate } from "@/lib/posts";
import { LeftMargin } from "@/app/components/LeftMargin";
import { Collage } from "@/app/components/Collage";
import { EmailSignup } from "@/app/components/EmailSignup";

export const metadata = {
  title: "Field guides",
  description:
    "The Field Guide to Thinking For Ourselves in the Age of AI.",
};

export default function FieldGuidesPage() {
  const entries = getFieldGuideEntries();

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
            "go explore it yourself" is A PLAIN ANCHOR, deliberately, and not next/link.
            /field-guides/fgttfo/ is a directory of static files in public/, not a Next
            route: it is the Vite build of the viewer, copied in by export_guide.py.
            next/link would hand the path to the client router, which has no such route in
            its manifest. An <a> forces a real document load, which is what actually
            fetches index.html.

            The trailing slash matters for the same reason the viewer's api.ts resolves
            read-graph.json against import.meta.env.BASE_URL: landing on .../fgttfo without
            it resolves relative URLs one level too high.
          */}
          <p className="mb-10">
            You can keep track of updates to the Field Guide here, or{" "}
            <a href="/field-guides/fgttfo/" className="fg-explore">
              go explore it yourself
            </a>
            !
          </p>

          {entries.length === 0 ? (
            <p style={{ color: "var(--accent-secondary)" }}>
              Nothing logged yet.
            </p>
          ) : (
            <ul className="fg-entries space-y-6">
              {entries.map((entry) => (
                <li key={entry.slug} className="fg-entry">
                  <div className="fg-entry-head">
                    <h2 className="fg-entry-title">{entry.title}</h2>
                    {entry.date && (
                      <span className="fg-entry-date">{formatDate(entry.date)}</span>
                    )}
                  </div>
                  {/*
                    The body is Markdown the curator wrote, rendered to HTML at build
                    time by lib/field-guides.ts. It is first-party content in a
                    statically exported site — there is no user input anywhere near it.
                  */}
                  <div
                    className="fg-entry-body"
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
    </>
  );
}
