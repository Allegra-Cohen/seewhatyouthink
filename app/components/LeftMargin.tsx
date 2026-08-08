import Link from "next/link";
import { img } from "@/lib/imageLoader";

/**
 * The mobile masthead, and on desktop nothing at all.
 *
 * The desktop stacked title used to live here, in the page grid's first column.
 * It now lives in `Collage`, because it and the drawings have to be one
 * composition in one coordinate system or they slide past each other on resize —
 * see COLLAGE_RESIZE.md. This still renders in the grid so that column keeps its
 * `1fr`; leaving it empty on desktop is also what stops the old `13rem` indent
 * from forcing that column wider than its share and shoving the text rightward.
 */
export function LeftMargin() {
  return (
    <div>
      {/* Mobile: horizontal title with eye drawing and nav */}
      <div className="flex lg:hidden items-center gap-3 px-4 pt-4 pb-2 pointer-events-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img("/drawings/eye.png")}
          alt=""
          className="opacity-50"
          style={{ width: "3rem", height: "3rem", objectFit: "contain" }}
        />
        <h1
          style={{ fontFamily: "var(--font-lato)", fontSize: "1.4rem" }}
          className="font-black leading-[1.1]"
        >
          see what<br />you think
        </h1>
        {/* The only route to /field-guides on a phone: Collage — which carries
            the red string into it on desktop — is `hidden lg:block`. Wraps rather than
            overflowing, since three labels plus the eye and the title don't fit on one
            line at 375px. */}
        <div className="ml-auto flex flex-wrap justify-end gap-x-4 gap-y-1" style={{ fontFamily: "var(--font-lato)", fontSize: "0.85rem", fontWeight: 700 }}>
          <Link href="/" className="hover:text-accent transition-colors">home</Link>
          <Link href="/about" className="hover:text-accent transition-colors">about me</Link>
          <Link href="/field-guides" className="hover:text-accent transition-colors">field guides</Link>
        </div>
      </div>
    </div>
  );
}
