import { LeftMargin } from "@/app/components/LeftMargin";
import { Collage } from "@/app/components/Collage";
import { Headshot } from "@/app/components/Headshot";

export const metadata = { title: "About", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <>
      <Collage />
      <div
        // The same three columns as a post and the Writing list — see the note in
        // app/page.tsx. This page was left behind on the old `1fr 2fr 1fr` when the
        // others moved, which is why its text was narrower than a post's.
        className="relative grid grid-cols-1 lg:grid-cols-[25%_minmax(0,1fr)_var(--right-col)] min-h-screen pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <LeftMargin />
        {/* `.about-main` (globals.css) sets the right padding, because on this page it
            has to clear the headshot rather than be a flat 3rem. It was `lg:pr-40` —
            160px, which is what held the text 227px short of a post's width. */}
        <main className="about-main py-8 px-6 lg:py-16 pointer-events-auto">
          <h1
            style={{
              fontFamily: "var(--font-lato)",
              marginTop: "clamp(2.5rem, 3vw, 4.5rem)",
            }}
            className="text-4xl font-bold mb-8"
          >
            Allegra A. Beal Cohen
          </h1>
          <div className="mb-12">
            <p>Hi! You're on my page. I vaguely remember html pages from the days of the good Internet. Claude makes it a lot easier now.</p>
            <p>I'm interested in knowledge curation, new interfaces and large-scale qualitative data. I'm currently Program Director of Talk to the City at the AI Objectives Institute.
            Before that, I was an ARC Fellow at Renaissance Philanthropy, and before <em>that</em>, I was at DARPA where I ran the Collaborative Knowledge Curation
            effort.</p>
            <p>
            My background is in computational modeling. I earned a Ph.D. from the Agricultural and Biological Engineering department at University of Florida,
            building an agent-based model of gender norms in agricultural systems. I did my postdoc on the DARPA Habitus program, where I built a little tool
            for processing the qualitative data I was eliciting from local experts in the Senegal River Valley.</p>
            <p>I'm currently reading <s>Vernor Vinge, George Saunders and Darwin's book on worms (strangely relaxing.)</s> <em>Anathem</em> again. I'm always reading William Gibson.</p>
          </div>
          <div style={{ height: "10vw" }} />
        </main>
        <div className="px-6 pb-8 -mt-6 lg:mt-0 lg:py-8 lg:pr-2">
          {/* `.about-headshot` (globals.css) is the leftward overhang into the prose
              column, derived from --right-col instead of the old fixed `-ml-60`. */}
          <div className="about-headshot flex justify-center lg:block lg:mt-24 pointer-events-auto w-fit">
            <Headshot />
          </div>
        </div>
      </div>
    </>
  );
}
