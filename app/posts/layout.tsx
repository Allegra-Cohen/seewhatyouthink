import { LeftMargin } from "@/app/components/LeftMargin";
import { BackgroundDrawings } from "@/app/components/BackgroundDrawings";
import { SummaryLensProvider } from "@/app/components/SummaryLensProvider";

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SummaryLensProvider>
      <BackgroundDrawings />
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] min-h-screen pointer-events-none" style={{ zIndex: 1 }}>
        <LeftMargin />
        <main className="py-8 px-6 lg:py-16 lg:px-25 pointer-events-auto">
          {children}
          <div style={{ height: "10vw" }} />
        </main>
        <div />
      </div>
    </SummaryLensProvider>
  );
}
