import { LeftMargin } from "@/app/components/LeftMargin";
import { BackgroundDrawings } from "@/app/components/BackgroundDrawings";
import { Headshot } from "@/app/components/Headshot";

export default function AboutPage() {
  return (
    <>
      <BackgroundDrawings />
      <div
        className="relative grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] min-h-screen pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <LeftMargin />
        <main className="py-8 px-6 lg:py-16 pointer-events-auto lg:pr-40">
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
            <p>I'm currently reading Vernor Vinge, George Saunders and Darwin's book on worms (strangely relaxing.) I'm always reading William Gibson.</p>
          </div>
          <div style={{ height: "10vw" }} />
        </main>
        <div className="px-6 pb-8 lg:py-8 lg:pr-2 pointer-events-auto">
          <div className="flex justify-center lg:block lg:mt-24 lg:-ml-60">
            <Headshot />
          </div>
        </div>
      </div>
    </>
  );
}
