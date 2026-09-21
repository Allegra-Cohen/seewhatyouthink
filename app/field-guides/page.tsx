// The guide lived here until 2026-09-16. Search results and old links still point at
// this URL, so this page forwards them to /field-guide. GitHub Pages can't send a real
// 301, and Next's redirect() only redirects in the browser via JavaScript, so this is an
// instant <meta refresh> (which Google treats as a permanent redirect) plus a canonical
// link, both in the static HTML.
export const metadata = {
  alternates: { canonical: "/field-guide" },
};

export default function OldFieldGuides() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/field-guide" />
      <a href="/field-guide">/field-guide</a>
    </>
  );
}
