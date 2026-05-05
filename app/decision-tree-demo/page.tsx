import { LeftMargin } from "@/app/components/LeftMargin";
import { BackgroundDrawings } from "@/app/components/BackgroundDrawings";
import { SummaryLensProvider } from "@/app/components/SummaryLensProvider";
import {
  DecisionTree,
  Option,
  Outcome,
  OutcomeText,
  Question,
  Tail,
} from "@/app/components/DecisionTree";

export default function DecisionTreeDemo() {
  return (
    <SummaryLensProvider>
      <BackgroundDrawings />
      <div
        className="relative grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] min-h-screen pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <LeftMargin />
        <main className="py-8 px-6 lg:py-16 lg:px-25 pointer-events-auto">
          <h1
            style={{ fontFamily: "var(--font-lato)" }}
            className="text-3xl font-bold mb-4"
          >
            Decision tree demo
          </h1>
          <p style={{ opacity: 0.75 }}>
            New model: every Option declares what it{" "}
            <code>open</code>s. Picking the option reveals each id (Options
            land in their declared row; Outcomes land in the outcome card
            slot). <code>OutcomeText</code> blocks live below the tree and
            render only when their matching outcome is reached.{" "}
            <code>Tail</code> renders only when an OutcomeText is showing.
          </p>

          <DecisionTree>
            <Question row={1}>
              How long, if ever, until sensemaking crosses the line?
            </Question>
            <Question row={2}>Why would sensemaking cross the line?</Question>
            <Question row={3}>Should sensemaking remain below the line?</Question>

            <Option row={1} id="1a" opens="4a">
              Never, or long enough from now that I don&rsquo;t care.
            </Option>
            <Option row={1} id="1b" opens="2a">
              Soon.
            </Option>
            <Option row={1} id="1c" opens="4c">
              I really don&rsquo;t want to pick a thing &mdash; I&rsquo;d
              rather think about all the things at once.
            </Option>

            <Option row={2} id="2a" opens="3a,3b">
              AI gets better and we get worse.
            </Option>

            <Option row={3} id="3a" opens="4b">
              Yes &mdash; we need to remain in the loop.
            </Option>
            <Option row={3} id="3b" opens="4a">
              No &mdash; I don&rsquo;t believe humans will keep up.
            </Option>

            <Outcome id="4a">Challenge Version 1</Outcome>
            <Outcome id="4b">Challenge Version 2</Outcome>
            <Outcome id="4c">Snowglobe!</Outcome>
          </DecisionTree>

          <OutcomeText id="4a">
            <p>
              <strong>Challenge Version 1.</strong> The argument here is that
              the line will move (or already has) and our job is to make
              sure the move happens with humans still meaningfully in the
              loop. Long-form prose explaining the lever, the constraints,
              and what readers can do.
            </p>
          </OutcomeText>

          <OutcomeText id="4b">
            <p>
              <strong>Challenge Version 2.</strong> A different framing for
              the same problem: keep the human-in-the-loop requirement load-
              bearing rather than aspirational. Long-form prose walking
              through what that actually buys you and what it costs.
            </p>
          </OutcomeText>

          <OutcomeText id="4c">
            <p>
              <strong>Snowglobe!</strong> A self-contained version of the
              argument that doesn&rsquo;t require you to commit to a single
              prediction. Long-form prose pitching the snowglobe lever and
              when it&rsquo;s the right tool.
            </p>
          </OutcomeText>

          <Tail>
            <p>
              Whichever version you ended up at, the meta-point is the same:
              <em> the lever you reach for depends on what you think the
              world will look like in five years</em>, not on the absolute
              merit of any individual proposal. That&rsquo;s why the
              question matters before the answer does.
            </p>
          </Tail>

          <div style={{ height: "10vw" }} />
        </main>
        <div />
      </div>
    </SummaryLensProvider>
  );
}
