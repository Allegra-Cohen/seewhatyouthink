"use client";

import { useState } from "react";

// A set of organic blob paths (viewBox 0 0 200 200)
const BLOB_PATHS = [
  "M 100 10 C 140 5, 180 30, 185 70 C 190 110, 170 155, 140 175 C 110 195, 60 190, 35 165 C 10 140, 5 100, 15 65 C 25 30, 60 15, 100 10 Z",
  "M 95 8 C 135 0, 185 25, 190 75 C 195 125, 165 170, 125 185 C 85 200, 30 185, 12 145 C -6 105, 10 50, 40 25 C 70 0, 95 8, 95 8 Z",
  "M 105 12 C 150 5, 190 40, 188 85 C 186 130, 160 175, 120 188 C 80 201, 25 180, 10 140 C -5 100, 8 45, 45 20 C 82 -5, 105 12, 105 12 Z",
];

export function HoverBlob({
  color,
  blobIndex = 0,
  label,
  blobStyle,
  labelStyle,
  children,
}: {
  color: string;
  blobIndex?: number;
  label?: string;
  blobStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const path = BLOB_PATHS[blobIndex % BLOB_PATHS.length];

  return (
    <div
      className="relative w-full h-full overflow-visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute w-full h-full pointer-events-none"
        style={{
          opacity: hovered ? 1 : 0,
          transition: "opacity 200ms ease",
          top: "-5%",
          left: "5%",
          width: "110%",
          height: "110%",
          ...blobStyle,
        }}
        preserveAspectRatio="none"
      >
        <path d={path} fill={color} fillOpacity={0.25} />
      </svg>
      {children}
      {/* The label is ALWAYS visible, not a hover reveal. These labels are the
          site's navigation, and a nav you have to find by sweeping the mouse over
          a background collage is one readers told us they could not find at all.
          The blob still belongs to hover — it is the affordance that says "this
          particular drawing is the thing you are about to click". */}
      {label && (
        <span
          className="hover-blob-label"
          style={{
            position: "absolute",
            top: "50%",
            right: "10%",
            transform: "translateY(-50%)",
            fontFamily: 'var(--font-garamond), Garamond, "Times New Roman", serif',
            fontWeight: 400,
            color,
            pointerEvents: "none",
            ...labelStyle,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
