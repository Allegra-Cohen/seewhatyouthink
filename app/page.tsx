import Link from "next/link";
import { HoverBlob } from "@/app/components/HoverBlob";
import { img } from "@/lib/imageLoader";

/* ── The landing page ──────────────────────────────────────────────────────────
 * The masthead, and the three ways into the site. Nothing else — no post list, no
 * subscribe box, no scroll.
 *
 * IT DOES NOT RENDER `Collage`. Every other page does, and the collage carries these
 * same three drawings down the left margin as background. Here they ARE the page, at
 * full strength rather than 50% opacity, with their names under them instead of
 * beside them. Two copies of the same picture on one screen is the thing to avoid.
 *
 * It does not render `LeftMargin` either — that is the phone's masthead, and this
 * whole page is a masthead.
 *
 * WHY THE LABELS ARE ALWAYS ON HERE. In the collage they appear on hover only, now
 * that this page exists to name the destinations plainly. This is the page that does
 * that naming, so its labels cannot themselves be a hover reveal.
 *
 * Sizes all live in globals.css under `.landing-*`, as named variables, because they
 * are the numbers most likely to be nudged.
 */

/** One drawing, its blob, and its name underneath. */
function Destination({
  href,
  src,
  label,
  color,
  blobIndex,
  ratio,
  artClass,
}: {
  href: string;
  src: string;
  label: string;
  color: string;
  blobIndex: number;
  /** The file's own width/height, so the box matches the drawing and the blob
   *  stretched over it isn't distorted. */
  ratio: string;
  artClass: string;
}) {
  return (
    <Link href={href} className="landing-item">
      <span className={`landing-art ${artClass}`} style={{ aspectRatio: ratio }}>
        <HoverBlob color={color} blobIndex={blobIndex}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(src)} alt="" className="w-full h-full object-contain" />
        </HoverBlob>
      </span>
      <span className="landing-label" style={{ color }}>
        {label}
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="landing">
      <div className="landing-masthead">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img("/drawings/eye.png")} alt="" className="landing-eye" />
        <h1 className="landing-title">See what you think</h1>
      </div>

      {/* The rough triangle: the plant at the apex, the other two below it. A <nav>
          because on this page these three links are the entire navigation. */}
      <nav className="landing-triangle" aria-label="Sections">
        <Destination
          href="/writing"
          src="/drawings/rubber_plant.png"
          label="writing"
          color="#4b830d"
          blobIndex={0}
          ratio="457 / 794"
          artClass="landing-apex"
        />
        <div className="landing-base">
          <Destination
            href="/about"
            src="/drawings/statue.png"
            label="about"
            color="#7346cf"
            blobIndex={1}
            ratio="421 / 521"
            artClass="landing-foot"
          />
          <Destination
            href="/field-guide"
            src="/drawings/string.png"
            label="field guide"
            color="#a53f2a"
            blobIndex={2}
            ratio="544 / 568"
            artClass="landing-foot"
          />
        </div>
      </nav>
    </main>
  );
}
