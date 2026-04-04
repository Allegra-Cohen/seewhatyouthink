"use client";

import { useState, useRef, useEffect } from "react";

function Leaf({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {/* Leaf blade — pointed tip top-right, curved body */}
      <path
        d="M3.5 12.5 C3.5 12.5, 2 7, 5 4 C7 2, 11 1.5, 13 1.5 C13 3.5, 12.5 7.5, 10 10 C7.5 12.5, 3.5 12.5, 3.5 12.5Z"
        fill={color}
      />
      {/* Center vein */}
      <path
        d="M12.5 2 C10 5, 7 8.5, 3.5 12.5"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Stem */}
      <path
        d="M3.5 12.5 C2.5 13.5, 1.5 14, 1 14.5"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Footnote colors match leaf order: purple, green, red
const FOOTNOTE_COLORS = [
  { color: "#7346cf", bg: "rgba(115, 70, 207, 0.05)" },  // purple
  { color: "#4b830d", bg: "rgba(75, 131, 13, 0.05)" },   // green
  { color: "#a53f2a", bg: "rgba(165, 63, 42, 0.05)" },   // red
];

const REFERENCE_STYLE = { color: "#a53f2a", bg: "rgba(165, 63, 42, 0.05)" };

export function MarginNote({
  variant,
  children,
  id,
}: {
  variant: "footnote" | "reference";
  children: React.ReactNode;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [noteHovered, setNoteHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const noteRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLButtonElement>(null);
  const lingerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Assign index by reading DOM order. Notes with the same `id` share a number.
  useEffect(() => {
    if (!noteRef.current) return;
    const allOfType = Array.from(
      document.querySelectorAll(`[data-margin-variant="${variant}"]`)
    ) as HTMLElement[];

    if (id) {
      // Find the first element with this id — reuse its index
      const first = allOfType.find((el) => el.dataset.marginId === id);
      if (first && first !== noteRef.current) {
        // Count unique notes before the first occurrence
        const seen = new Set<string>();
        let count = 0;
        for (const el of allOfType) {
          if (el === first) break;
          const elId = el.dataset.marginId;
          if (elId) {
            if (!seen.has(elId)) { count++; seen.add(elId); }
          } else {
            count++;
          }
        }
        setIndex(count + 1);
      } else {
        // This is the first with this id — count unique notes before it
        const seen = new Set<string>();
        let count = 0;
        for (const el of allOfType) {
          if (el === noteRef.current) break;
          const elId = el.dataset.marginId;
          if (elId) {
            if (!seen.has(elId)) { count++; seen.add(elId); }
          } else {
            count++;
          }
        }
        setIndex(count + 1);
      }
    } else {
      // No id — count unique notes before this one
      const seen = new Set<string>();
      let count = 0;
      for (const el of allOfType) {
        if (el === noteRef.current) break;
        const elId = el.dataset.marginId;
        if (elId) {
          if (!seen.has(elId)) { count++; seen.add(elId); }
        } else {
          count++;
        }
      }
      setIndex(count + 1);
    }
  });

  // Proximity-based hover — shows all notes within range, not just one
  useEffect(() => {
    const THRESHOLD = 64; // px (~4rem)

    const handleMouseMove = (e: MouseEvent) => {
      if (!markerRef.current) return;
      const rect = markerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      setHovered(dist < THRESHOLD);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Linger for 5s after hover ends, unless another note needs the space
  // Stay visible indefinitely while the note itself is hovered
  useEffect(() => {
    if (hovered || noteHovered) {
      if (lingerTimer.current) clearTimeout(lingerTimer.current);
      setVisible(true);
    } else if (visible) {
      lingerTimer.current = setTimeout(() => setVisible(false), 5000);
    }
    return () => {
      if (lingerTimer.current) clearTimeout(lingerTimer.current);
    };
  }, [hovered, noteHovered]);

  // If another note is now hovered and overlaps this lingering note, dismiss early
  useEffect(() => {
    if (!visible || hovered || !noteRef.current) return;

    const checkOverlap = () => {
      const el = noteRef.current;
      if (!el) return;
      const myRect = el.getBoundingClientRect();
      const allNotes = document.querySelectorAll("[data-margin-note]");
      for (const sib of allNotes) {
        if (sib === el) continue;
        const sibEl = sib as HTMLElement;
        // Check if sibling is actively hovered (full opacity)
        if (sibEl.style.opacity !== "0.8" && sibEl.style.opacity !== "1") continue;
        const sibRect = sibEl.getBoundingClientRect();
        const overlaps = !(myRect.bottom < sibRect.top || myRect.top > sibRect.bottom);
        if (overlaps) {
          setVisible(false);
          if (lingerTimer.current) clearTimeout(lingerTimer.current);
          return;
        }
      }
    };

    const interval = setInterval(checkOverlap, 200);
    return () => clearInterval(interval);
  }, [visible, hovered]);

  // Pull notes toward viewport center when near edges, then fix overlaps
  useEffect(() => {
    if (!noteRef.current || !visible) return;
    const el = noteRef.current;

    // Reset previous adjustments
    el.style.transform = "";
    el.style.marginTop = "";

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const comfortTop = vh * 0.2;
    const comfortBottom = vh * 0.75;

    // Pull toward comfort zone if outside it
    let pull = 0;
    if (rect.top < comfortTop) {
      pull = comfortTop - rect.top;
    } else if (rect.bottom > comfortBottom) {
      pull = comfortBottom - rect.bottom;
    }

    if (pull !== 0) {
      el.style.transform = `translateY(${pull}px)`;
    }

    // Fix overlapping with visible sibling notes
    const allNotes = Array.from(
      document.querySelectorAll("[data-margin-note]")
    ) as HTMLElement[];
    const myIdx = allNotes.indexOf(el);
    if (myIdx > 0) {
      const prev = allNotes[myIdx - 1];
      // Only check if prev is also visible
      if (prev.style.opacity !== "0") {
        const prevRect = prev.getBoundingClientRect();
        const myNewRect = el.getBoundingClientRect();
        if (myNewRect.top < prevRect.bottom + 12) {
          const shift = prevRect.bottom - myNewRect.top + 16;
          el.style.marginTop = `${shift}px`;
        }
      }
    }
  });

  const isFootnote = variant === "footnote";
  const footnoteIdx = index > 0 ? (index - 1) % FOOTNOTE_COLORS.length : 0;
  const { color, bg } = isFootnote
    ? FOOTNOTE_COLORS[footnoteIdx]
    : REFERENCE_STYLE;

  const markerContent = isFootnote ? (
    <Leaf color={color} size={20} />
  ) : (
    String(index)
  );

  const marginMarkerContent = isFootnote ? (
    <span className="mr-1"><Leaf color={color} size={22} /></span>
  ) : (
    <span style={{ color, opacity: 1 }} className="font-semibold mr-1">{index}.</span>
  );

  return (
    <span>
      <button
        ref={markerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={isFootnote ? undefined : { color }}
        className="
          inline-flex items-center justify-center
          text-[0.85rem] font-semibold leading-none
          cursor-pointer select-none
          align-super
          lg:cursor-default
        "
        aria-label={`${variant} ${index}`}
      >
        {markerContent}
      </button>

      {open && (
        <span
          style={{ color, backgroundColor: bg, fontSize: "clamp(12pt, 1vw, 15pt)", fontFamily: "var(--font-lato)", fontWeight: 400 }}
          className="block lg:hidden rounded px-3 py-2 mt-1 mb-1"
        >
          {children}
        </span>
      )}

      <span
        ref={noteRef}
        data-margin-note
        data-margin-variant={variant}
        data-margin-id={id}
        onMouseEnter={() => setNoteHovered(true)}
        onMouseLeave={() => setNoteHovered(false)}
        style={{
          color,
          opacity: visible ? 0.8 : 0,
          fontSize: "clamp(12pt, 1vw, 15pt)",
          fontFamily: "var(--font-lato)",
          fontWeight: 400,
          transition: "opacity 0.15s ease",
          pointerEvents: visible ? "auto" : "none",
        }}
        className="hidden lg:block absolute right-0 w-[25%] pr-6 leading-snug"
      >
        {marginMarkerContent}
        {children}
      </span>
    </span>
  );
}
