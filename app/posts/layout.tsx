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
          /field-guides. */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[25%_minmax(0,1fr)_var(--right-col)] min-h-screen pointer-events-none" style={{ zIndex: 1 }}>
        <LeftMargin />
        <main className="post-content py-8 px-6 lg:py-16 lg:pl-25 lg:pr-12 pointer-events-auto">
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
