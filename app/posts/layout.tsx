import { LeftMargin } from "@/app/components/LeftMargin";
import { Collage } from "@/app/components/Collage";
import { SummaryLensProvider } from "@/app/components/SummaryLensProvider";
import { EmailSignup } from "@/app/components/EmailSignup";

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SummaryLensProvider>
      <Collage />
      {/* Grid rationale — see the note in app/page.tsx; all three columns are the same
          here. The subscribe module is the third column now rather than a block at the
          end of the post, so it sits top-right exactly as it does on / and
          /field-guide. */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[25%_minmax(0,1fr)_var(--right-col)] min-h-screen pointer-events-none" style={{ zIndex: 1 }}>
        <LeftMargin />
        {/* No left indent of its own — `px-6` is the same 24px the Writing list,
            /field-guide and /about use, so moving from the list into a post doesn't
            shift the text sideways. It used to be `lg:pl-25` (100px), which put a gap
            between the collage and the prose that no other page had. */}
        <main className="post-content py-8 px-6 lg:py-16 lg:pr-12 pointer-events-auto">
          {children}
          <div style={{ height: "10vw" }} />
        </main>
        <div className="self-start lg:mt-32 mt-8 mx-auto lg:mx-0 w-1/2 lg:w-auto lg:pr-6 pointer-events-auto">
          <EmailSignup />
        </div>
      </div>
    </SummaryLensProvider>
  );
}
