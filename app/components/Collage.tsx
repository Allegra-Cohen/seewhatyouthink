"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HoverBlob } from "./HoverBlob";
import { DrivableDrawing } from "./DrivableDrawing";
import { img } from "@/lib/imageLoader";

/* ── The stage ─────────────────────────────────────────────────────────────────
 * The title and the drawings are ONE composition, tuned at 1440×900, and every
 * number in this file is in that composition's own units. `--u` (defined on
 * `.left-stage` in globals.css) is how many px one unit is worth in the current
 * window:
 *
 *     --u: min(100vw / 1440, 100vh / 900)
 *
 * so the whole picture scales as a unit and nothing inside it can drift relative
 * to anything else, at any window size. At 1440×900 one unit is exactly 1px, so
 * the numbers below are also the measured pixel positions of the tuned layout.
 *
 * Do NOT reintroduce vw, vh, rem or bare px inside the stage. Two coordinate
 * systems crossing over is the bug this replaced — the drawings used to be
 * positioned as a fraction of viewport *width*, including how far up from the
 * bottom they sat, so widening the window pushed them off the top of the screen
 * and onto the title. Written up in COLLAGE_RESIZE.md.
 *
 * ── ANCHORS ───────────────────────────────────────────────────────────────────
 * One scale, two anchors. The masthead — the title and the eye above "you" — hangs
 * from the top of the window; the rubber plant and everything below it hangs from
 * the bottom, so the drawings keep resting on the ground. Extra window height opens
 * up in the gap between the two groups rather than pushing either off its edge.
 *
 * Each group is rigid *internally*, which is the part that matters: the eye cannot
 * drift off "you", and the drawings cannot drift into each other, because within a
 * group every number is in the same units and scales by the same `--u`.
 *
 * The two groups cannot collide either. `--u` is never larger than 100vh/900, so
 * the window is always at least 900 units tall, and at exactly 900 the gap between
 * the bottom of "think" (283.3) and the top of the rubber plant (309.6) is 26 units.
 * Any taller window only widens it.
 *
 * INVARIANT: no interactive drawing may extend past x = 360.
 * Every page lays out `lg:grid-cols-[1fr_2fr_1fr]`, so its text column starts at
 * 25vw; and 360 units is at most 360 × 100vw/1440 = 25vw, because `--u` is never
 * larger than 100vw/1440. So the nav can never end up underneath the text, which
 * paints above it and would take its clicks. `assertNavClearance` below fails
 * loudly in dev if that ever stops being true.
 */
const NAV_RIGHT_LIMIT = 360;

/** One composition unit, as a CSS length. */
const u = (n: number) => `calc(${n} * var(--u))`;

type Drawing = {
  src: string;
  /** Width and height, in units. */
  size: number;
  /** From the viewport's left edge, in units. */
  left: number;
  /** Which edge this hangs from, and how far, in units. See ANCHORS above. */
  y: { top: number } | { bottom: number };
  blob: { color: string; index: number; label: string; labelStyle?: React.CSSProperties } | null;
  href: string | null;
};

/**
 * `labelStyle.transform` nudges a label off its drawing and into clear space
 * beside it. HoverBlob's default puts the label at `right: 10%` of the box, which
 * lands it on top of the statue and in the middle of the string. The nudge is in
 * stage units like everything else, and it replaces the default `translateY(-50%)`
 * that does the vertical centring — so any override has to restate it.
 *
 * These labels are on permanently — they are the nav, and readers could not find
 * it while it only appeared under the cursor. Only the blob is a hover reveal. So
 * placement now has to read well at rest, not just for the moment you are pointing
 * at it: a label overlapping its neighbour is a standing collision, not a flicker.
 *
 * The string's label is the one to watch: it starts at x 250.8, so it cannot be
 * pushed much further right than this without crossing 360 into the text column.
 */
const DRAWINGS: Drawing[] = [
  // ── Hangs from the bottom, with the ground ────────────────────────────────
  { src: "/drawings/rubber_plant.png", size: 187.2, left: -14.4, y: { bottom: 403.2 }, blob: { color: "#4b830d", index: 0, label: "home", labelStyle: { transform: `translate(${u(-8)}, -50%)` } }, href: "/" },
  { src: "/drawings/gumdrop_purple.png", size: 50.4, left: 144, y: { bottom: 388.8 }, blob: null, href: null },
  { src: "/drawings/string.png", size: 216, left: 144, y: { bottom: 135.36 }, blob: { color: "#a53f2a", index: 0, label: "field guides", labelStyle: { transform: `translate(${u(20)}, calc(-50% - ${u(20)}))` } }, href: "/field-guides" },
  { src: "/drawings/bush.png", size: 115.2, left: 259.2, y: { bottom: 32.4 }, blob: null, href: null },
  { src: "/drawings/oracle.png", size: 216, left: 0, y: { bottom: 8.64 }, blob: null, href: null },
  { src: "/drawings/statue.png", size: 172.8, left: 14.4, y: { bottom: 210.24 }, blob: { color: "#7346cf", index: 0, label: "about", labelStyle: { transform: `translate(${u(6)}, -50%)` } }, href: "/about" },
  { src: "/drawings/gumdrop_red.png", size: 43.2, left: 201.6, y: { bottom: 15.84 }, blob: null, href: null },

  // ── Hangs from the top, with the masthead ─────────────────────────────────
  // Above "you" and centred on it (its midpoint is x 298.8), sitting in the white
  // gap between the "See" and "what" lines. It used to sit *behind* "you". It is
  // part of the title, so it anchors with the title.
  { src: "/drawings/eye.png", size: 122.4, left: 237.6, y: { top: 19.6 }, blob: null, href: null },
];

/**
 * Dev-only guard on the invariant above. The arithmetic makes overlap
 * impossible, but only for as long as every nav drawing stays inside 360 units —
 * which nothing else enforces, and which used to hold purely by coincidence.
 */
function useNavClearanceCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const check = () => {
      const main = document.querySelector("main");
      if (!main) return;
      const textLeft = main.getBoundingClientRect().left;
      document.querySelectorAll<HTMLElement>(".left-stage .background-drawing").forEach((el) => {
        if (!el.querySelector("a")) return; // decorative, may overlap freely
        const right = el.getBoundingClientRect().right;
        if (right > textLeft + 0.5) {
          console.error(
            `[collage] "${el.dataset.src}" is a nav drawing but reaches ${Math.round(right - textLeft)}px ` +
              `into the text column, which paints on top of it and will take its clicks. ` +
              `Keep left + size <= ${NAV_RIGHT_LIMIT} units. See COLLAGE_RESIZE.md.`
          );
        }
      });
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
}

export function Collage() {
  useNavClearanceCheck();

  return (
    <>
      <div className="left-stage hidden lg:block">
        {/* The masthead. Positioned in stage units like everything else, so it can
            no longer slide past the drawings. The explicit weight and line-height
            are what this actually renders as today: globals.css's unlayered `h1`
            rule outranks Tailwind's layered `font-black` / `leading-[0.95]`
            utilities, so those were never taking effect, and `margin-top: 1em` on
            that same rule is where the 17.6 offset came from. */}
        <h1
          className="left-margin-title"
          style={{
            position: "absolute",
            left: u(43.2),
            top: u(17.6),
            margin: 0,
            fontFamily: "var(--font-lato)",
            fontSize: u(57.6),
            fontWeight: 700,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
          }}
        >
          See <br />
          <span style={{ marginLeft: u(48) }} />what<br />
          <span style={{ marginLeft: u(208) }} />you<br />
          <span style={{ marginLeft: u(128) }} />think
        </h1>

        {DRAWINGS.map(({ src, size, left, y, blob, href }) => {
          const image = (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img(src)} alt="" className="w-full h-full object-contain opacity-50" />
          );

          let content = image;
          if (blob) {
            content = (
              <HoverBlob color={blob.color} blobIndex={blob.index} label={blob.label} labelStyle={blob.labelStyle}>
                {href ? <Link href={href} className="block w-full h-full">{image}</Link> : image}
              </HoverBlob>
            );
          } else if (href) {
            content = <Link href={href} className="block w-full h-full">{image}</Link>;
          }

          return (
            <div
              key={src}
              className="absolute background-drawing"
              data-src={src.split("/").pop()}
              style={{
                left: u(left),
                ...("top" in y ? { top: u(y.top) } : { bottom: u(y.bottom) }),
                width: u(size),
                height: u(size),
                pointerEvents: blob || href ? "auto" : "none",
                overflow: "visible",
              }}
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* Deliberately OUTSIDE the stage. The gumdrop is a toy that roams the whole
          page rather than part of the left-column composition, and once clicked it
          switches to fixed pixel positioning and moves and collides in raw viewport
          coordinates.

          It parks in the bottom-right, BESIDE the TL;DR button rather than under it.
          It used to sit at `left: 75vw`, a point that drifts leftward into the prose
          as the window narrows — 75vw is inside the text column on any laptop.

          The offsets are in `rem`, not stage units, on purpose: this one drawing's
          position is a relationship to the TL;DR button (`bottom: 2rem; right: 2rem`
          in SummaryLensProvider.tsx), so it has to be measured the same way the
          button is or the two drift apart. Its SIZE stays in stage units, because
          that is a relationship to the other drawings. 8.5rem clears the button's
          own width with room to spare. */}
      <div className="fixed inset-0 pointer-events-none hidden lg:block" style={{ zIndex: 0 }}>
        <DrivableDrawing
          src="/drawings/gumdrop_green.png"
          size={u(50.4)}
          initialLeft={`calc(100vw - 8.5rem - ${u(50.4)})`}
          initialBottom="1.6rem"
          label="mischief"
        />
      </div>
    </>
  );
}
