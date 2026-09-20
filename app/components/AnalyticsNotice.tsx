/**
 * What the site counts, said once, quietly.
 *
 * NOT a consent banner and deliberately not on the posts themselves: a line at the foot
 * of a post would read as a disclosure about that post, which is exactly the "what are
 * they collecting?" jolt this is meant to avoid. It lives at the bottom of the two list
 * pages instead — findable by anyone who wonders, invisible to everyone else.
 *
 * GoatCounter sets no cookies and stores no IP or User-Agent, so there is nothing here
 * to opt out of; the script also skips visitors whose browser sends Do Not Track or
 * Global Privacy Control (see app/posts/layout.tsx).
 *
 * Rust (`--accent-tertiary`) and Garamond, at the size of the smallest text on the page.
 *
 * ALIGNED WITH THE RULE DOWN THE LEFT OF EACH POST, not with the text column's own
 * edge: `25%` is where column two starts, and `px-6` (1.5rem) is the padding every list
 * page puts inside it, which is exactly where `.post-row`'s border-left lands. So the
 * indent is the sum of the two, and the sentence starts on the same vertical line the
 * coloured rules do.
 */
export function AnalyticsNotice() {
  return (
    <div className="px-6 lg:pl-[calc(25%+1.5rem)] pb-12 pointer-events-auto" style={{ zIndex: 1, position: "relative" }}>
      <p
        style={{
          fontFamily: 'var(--font-garamond), Garamond, "Times New Roman", serif',
          fontSize: "clamp(10pt, 0.85vw, 12pt)",
          lineHeight: 1.4,
          color: "var(--accent-tertiary)",
          maxWidth: "40em",
        }}
      >
        I use GoatCounter on my posts to see how many people visit them. GoatCounter does
        not collect any identifying information.
      </p>
    </div>
  );
}
