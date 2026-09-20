"use client";

import { useEffect } from "react";

/** The GoatCounter site — the subdomain of the account, i.e. https://<code>.goatcounter.com. */
const SITE_CODE = "seewhatuthink";

/**
 * Counts one visit, per post, at GoatCounter. Renders nothing.
 *
 * Mounted from app/posts/layout.tsx, so it runs on posts and NOWHERE else: not on `/`,
 * `/writing`, `/about` or `/field-guide`. The remark reader under /field-guide/read/ is
 * a separate build and is counted (or not) by its own shell, ui/viewer/index.html in the
 * field guide repo.
 *
 * WHY A SCRIPT WE APPEND OURSELVES, rather than the <script> tag GoatCounter's docs give
 * you: the tag would load on every visit, and the two checks below have to happen first.
 *
 *  - Do Not Track / Global Privacy Control. Neither is legally binding here, but both
 *    are a reader saying "don't count me" in the only way a browser offers, and the cost
 *    of honouring them is a few visits we never hear about.
 *  - Development. `next dev` and the export preview would otherwise file local page
 *    loads as real ones, which at ten-visit scale is the whole signal.
 *
 * GoatCounter itself stores no cookie and never writes the IP or User-Agent to disk; it
 * hashes them in memory for 8 hours purely to tell a reload from a new visit. Nothing it
 * keeps points back at a person. See AnalyticsNotice.tsx for what the site says about it.
 */
export function VisitCounter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    const dnt = nav.doNotTrack ?? (window as { doNotTrack?: string }).doNotTrack;
    if (dnt === "1" || dnt === "yes" || nav.globalPrivacyControl) return;

    // A post is one page load, but React strict mode mounts effects twice in dev and a
    // client navigation could remount this: one tag per document, whatever happens.
    if (document.querySelector("script[data-goatcounter]")) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://gc.zgo.at/count.js";
    script.setAttribute(
      "data-goatcounter", `https://${SITE_CODE}.goatcounter.com/count`);
    document.body.appendChild(script);
  }, []);

  return null;
}
