# The left column doesn't hold together on resize

> **RESOLVED 2026-08-07.** Kept as the record of why the layout is built the way it
> is. What shipped, and the two rules worth not breaking, are in **"The fix that
> shipped"** at the bottom — read that first; everything above it is the diagnosis.

Observed 2026-08-07 in real Chrome (headless screenshots at 1920/1440/1164/1024 × 900,
`http://localhost:3000/`). This supersedes the description in
`field_guide/PUBLISHING_PLAN.md` Chunk C step 1, which only recorded the *narrowing* half
of the problem.

## What actually happens

| Width | What the left column looks like |
|---|---|
| **1920** | The eye has climbed **off the top of the screen** (only a sliver shows). The rubber plant has risen into the title and overlaps "what". The statue and the string have moved up a whole title-height. |
| **1440** | The tuned reference. Eye tucked behind "you", plant clear below "think". |
| **1164** | Eye has fallen **below** the title, leaving a dead gap where it used to sit. Everything else drops with it. |
| **1024** | Same, further. The title's indents no longer relate to anything — "you" juts right while the drawings have shrunk away from it. |

So it is not only that things collide when narrowing. **The collage travels vertically
across the whole viewport as the window changes width**, in both directions, and the title
stays still while it does.

## Why

Two independent causes, and the second is the bigger one.

1. **The title and the drawings are in different unit systems.**
   `BackgroundDrawings.tsx` is `fixed inset-0` with everything in `vw`.
   `LeftMargin.tsx:9-17` sizes the title `clamp(2.5rem, 4vw, 4.5rem)` but indents it in
   **rem** (`3rem` / `13rem` / `8rem`) — fixed pixels that never scale. Above ~1620px the
   `4.5rem` clamp ceiling also stops the title growing while the drawings keep going.

2. **`bottom` is expressed in `vw`, so *vertical* position tracks viewport *width*.**
   This is what makes the collage climb and fall. The eye is `bottom: 45vw`:

   | Viewport | `45vw` | Eye's distance from top (900px tall) |
   |---|---|---|
   | 1920 | 864px | 36px → **off screen** |
   | 1440 | 648px | 130px → correct |
   | 1164 | 524px | 254px → below the title |
   | 1024 | 461px | 317px → far below |

   The comment at `BackgroundDrawings.tsx:8-9` admits the values were converted from `vh`
   at a 1440×900 reference. The composition is tuned for exactly one window.

Neither is caused by the field-guide work. Both affect **home, about and every post**,
since all three mount `BackgroundDrawings` + `LeftMargin`.

## Can the text column cover the nav drawings?

The three drawings that are navigation — rubber plant (`/`), statue (`/about`), string
(`/field-guides`) — are in a layer at `z-index: 0`; every page's content grid is at
`z-index: 1`. So if the text column ever reached them it would both hide them and take
their clicks. Measured (real Chrome, CDP, `.background-drawing` elements containing an
`<a>` vs `main`'s left edge), identical on `/` and `/posts/the-challenge`:

| Window | Nav's right edge | Text column starts | Clearance |
|---|---|---|---|
| 1920 | 480 | 480 | **0** |
| 1600 | 400 | 400 | **0** |
| 1440 | 360 | 360 | **0** |
| 1280 | 320 | 331 | 11 |
| 1164 | 291 | 320 | 29 |
| 1024 | 256 | 306 | 50 |

The widest nav element is always `string.png`. It sits at `left: 10vw, size: 15vw`, so its
right edge is exactly **25vw** — and every page uses `lg:grid-cols-[1fr_2fr_1fr]`, so the
text column starts at exactly **25%** of the window. They touch precisely and never cross.

**That is a coincidence, not a design.** Nothing records it, and one bump to the string's
`size` would silently put the "field guides" link under the text.

(The extra clearance below 1280 is *also* a symptom of cause 1: the title's `13rem` indent
makes the left grid column's min-content wider than its `1fr` share, so the rem-indented
title is pushing the text column rightward at narrow widths.)

### Under a scaled stage the coincidence becomes a guarantee

With the whole composition scaled by `k = min(100vw/1440, 100vh/900)`, the nav's right edge
is `360px × k`. Since `k ≤ 100vw/1440` by construction:

```
nav right edge  =  360k  ≤  360 × vw/1440  =  0.25vw  =  where the text column starts
```

So the nav can never reach the text, at any window size, on any page — arithmetically, not
by tuning. Equality holds in tall windows (today's behaviour); in wide/short windows, which
is exactly where things break worst today, the clearance becomes strictly positive.

It is still worth taking an explicit gutter rather than shipping a 0px touch.

## The shape of any real fix

The title and the drawings have to become **one composition with one scale factor and one
anchor**. Scaling alone is not enough: if the title stays anchored to the top of the grid
column and the drawings to the bottom of the viewport, they still separate whenever the
viewport's *aspect* changes, because the slack between the two anchors changes.

A stage that always fits is `scale(min(100vw/1440, 100vh/900))` — at 1920×900 that is
`1.0`, so the collage simply stays at its tuned size instead of inflating off the top; at
1164×900 it is `0.808` and the whole picture, title included, shrinks as one.

## The fix that shipped

`BackgroundDrawings.tsx` is gone, replaced by **`app/components/Collage.tsx`**, which
holds the drawings *and* the desktop title. `LeftMargin.tsx` is now the mobile masthead
only. The header comment in `Collage.tsx` and the two blocks in `globals.css` carry the
details; this is the shape.

**Two numbers, each with exactly one definition.**

| | Defined in | Read by |
|---|---|---|
| `--u` — one composition unit | `globals.css` `:root` | everything in `Collage.tsx`, plus the gumdrop's size |
| `--right-col` — the right column's width | `globals.css` `:root` | the three page grids, `MarginNote.tsx`, `SummaryLensProvider.tsx` |

```css
--u: min(100vw / 1440, 100vh / 900);
```

Scaled with `calc()`, not `transform: scale()` — text stays laid out at its true size so
it cannot rasterise blurry, and `position: fixed` descendants still resolve against the
viewport rather than a transformed ancestor.

**One scale, two anchors.** The masthead (title + eye) hangs from the top; the rubber
plant and everything below hangs from the bottom. Each group is rigid internally, so the
eye cannot drift off "you" and the drawings cannot drift into each other. They cannot
collide either: `--u` never exceeds `100vh/900`, so the window is always at least 900
units tall, and the 27-unit gap between "think" and the plant only ever grows.

**The navigation guarantee.** Interactive drawings live within 360 units, and 360 units
is at most `360 × 100vw/1440 = 25vw` — exactly where every page's text column starts. So
the nav can never end up under the prose, which paints above it and would take its
clicks. This used to hold by *coincidence*; `assertNavClearance` in `Collage.tsx` now
fails loudly in dev if it stops holding.

### Two rules

1. **No `vw`, `vh`, `rem` or bare `px` inside the stage.** Two coordinate systems
   crossing over is the original bug. The one deliberate exception is the drivable
   gumdrop's *position*, which is in `rem` because it is a relationship to the TL;DR
   button (`bottom: 2rem; right: 2rem`) and has to be measured the way that button is.
   Its *size* stays in units, because that is a relationship to the other drawings.
2. **Never hardcode the right column's width again.** It was written out four separate
   times — `25%` in three grids, `w-[25%]` in `MarginNote`, and `left: 75%` / `width:
   22%` in `SummaryLensProvider` — each correct only while the grid was `1fr 2fr 1fr`.
   When the third column became a fixed width, the margin notes and the summary lens
   both silently landed on the prose. They all read `--right-col` now.

Also in the same pass: the grids became `25% | rest | --right-col`, so the prose reaches
farther right (1440: 720→760; 1920: 960→1120) and the subscribe form can no longer be
clipped on a smaller screen. Subscribe sits top-right on posts too, and its wrapper needs
`self-start` — as a stretched grid item with `pointer-events-auto` it becomes an
invisible full-height panel that swallows clicks on anything beneath it, which is what
stopped the gumdrop working.

**Still on the old grid:** `/about` and `/decision-tree-demo`. `about`'s third column
holds the headshot with its own `-ml-60` tuning, so it was left alone.

### Not to do

Don't nudge individual drawings or labels by fixed `px`. That is the original bug in
miniature. The one such offset that existed — the string's
`labelStyle: translateY(calc(-50% - 20px))` — has been absorbed into stage units.
