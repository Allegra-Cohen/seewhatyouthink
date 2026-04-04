"use client";

import { useSummaryLens } from "./SummaryLensProvider";

export function Summary({
  note,
  children,
}: {
  note: string;
  children: React.ReactNode;
}) {
  const { lensActive, setActiveSummaryText } = useSummaryLens();

  const handleMouseEnter = () => {
    if (lensActive) setActiveSummaryText(note);
  };

  const handleMouseLeave = () => {
    if (lensActive) setActiveSummaryText(null);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        lensActive
          ? {
              backgroundColor: "rgba(66, 135, 245, 0.08)",
              borderRadius: "2px",
              transition: "background-color 0.15s ease",
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
