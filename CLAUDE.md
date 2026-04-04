# My Blog Project

## What this is
A personal blog called "See what you think", built with Next.js (App Router), MDX, and Tailwind CSS.
Hosted on Vercel (not yet deployed). The audience is people I know personally
and potential funders — so design quality matters.

## Stack
- Next.js 15 (16.2.2), App Router
- MDX via @next/mdx and gray-matter
- Tailwind CSS v4
- TypeScript
- Lato font (Google Fonts, for title only)
- Garamond (system, for body text)

## Color palette
- Background: #fff8ed (cream)
- Foreground: #000000 (black)
- Primary accent: #4b830d (moss green)
- Secondary accent: #7346cf (purple)
- Tertiary accent: #a53f2a (rust)
Defined as CSS custom properties in app/globals.css.

## Structure
- app/page.tsx — homepage, lists all posts (not yet designed)
- app/posts/layout.tsx — post layout: 3-column grid (1/4 left margin, 1/2 content, 1/4 right margin)
- app/posts/[slug-name]/page.mdx — individual posts (direct folders, NOT under [slug])
- lib/posts.ts — utility that reads frontmatter from all posts
- new-post.mjs — script to scaffold a new post (node new-post.mjs "Title")

## Components
- app/components/MarginNote.tsx — shared base for Footnote and Reference (client component)
- app/components/Footnote.tsx — margin note with gumdrop image markers (purple/green/red cycle), text color matches gumdrop
- app/components/Reference.tsx — margin note with numbered markers in rust color
- app/components/LeftMargin.tsx — sticky "See what you think" title in Lato font
- app/components/BackgroundDrawings.tsx — fixed background collage of drawings in lower-left, all units in vw
- app/components/HoverBlob.tsx — reusable organic SVG blob hover effect (currently on rubber plant only)
- mdx-components.tsx — registers Footnote and Reference for use in MDX

## Design notes
- Footnote markers are tiny gumdrop images (purple, green, red) cycling. Colors match the accent palette.
- Reference markers are numbered in rust color.
- Both render as margin notes on desktop (right 25% column) and tap-to-toggle inline on mobile.
- Background drawings use vw units for sizes and positions to scale with viewport.
- Rubber plant drawing links to homepage and has a purple hover blob.
- Font sizes use clamp() for responsive scaling: body clamp(14pt, 1.2vw, 20pt), notes clamp(12pt, 1vw, 15pt).
- Post pages have a 10vw bottom spacer.

## Tailwind v4 gotcha
Dynamic class names via string interpolation (e.g. `${color}`) don't work in Tailwind v4 —
classes must be statically scannable. Use inline `style` props for dynamic values instead.

## What to build next
- Homepage design (app/page.tsx)
- Add hover blobs to more background drawings
- Mobile responsive layout for posts
