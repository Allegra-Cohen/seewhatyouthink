"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

interface SummaryLensContextType {
  lensActive: boolean;
  toggleLens: () => void;
  activeSummaryText: string | null;
  setActiveSummaryText: (text: string | null) => void;
}

const SummaryLensContext = createContext<SummaryLensContextType>({
  lensActive: false,
  toggleLens: () => {},
  activeSummaryText: null,
  setActiveSummaryText: () => {},
});

export function useSummaryLens() {
  return useContext(SummaryLensContext);
}

/* ── Collision helper ── */

function nudgeMarginNotes(boxEl: HTMLElement) {
  const box = boxEl.getBoundingClientRect();
  const notes = document.querySelectorAll("[data-margin-note]");

  // Reset all transforms first so we measure original positions
  notes.forEach((el) => {
    (el as HTMLElement).style.transition = "none";
    (el as HTMLElement).style.transform = "";
  });

  // Force reflow so measurements reflect the reset
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  boxEl.offsetHeight;

  notes.forEach((el) => {
    const note = el as HTMLElement;
    const noteRect = note.getBoundingClientRect();

    // Use generous overlap zone — pad the box by 16px on each side
    const pad = 16;
    const overlaps = !(
      box.bottom + pad < noteRect.top || box.top - pad > noteRect.bottom
    );

    if (overlaps) {
      const boxCenter = (box.top + box.bottom) / 2;
      const noteCenter = (noteRect.top + noteRect.bottom) / 2;

      if (noteCenter < boxCenter) {
        const shift = noteRect.bottom - (box.top - pad) + 12;
        note.style.transform = `translateY(-${shift}px)`;
      } else {
        const shift = box.bottom + pad - noteRect.top + 12;
        note.style.transform = `translateY(${shift}px)`;
      }
    }
    note.style.transition = "transform 0.15s ease";
  });
}

function resetMarginNotes() {
  const notes = document.querySelectorAll("[data-margin-note]");
  notes.forEach((el) => {
    const note = el as HTMLElement;
    note.style.transform = "";
    note.style.transition = "";
  });
}

/* ── Summary box (appears in right margin, follows mouse Y) ── */

function SummaryBox({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (boxRef.current) {
          boxRef.current.style.top = `${e.clientY}px`;
          nudgeMarginNotes(boxRef.current);
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
      resetMarginNotes();
    };
  }, []);

  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        left: "75%",
        top: 0,
        width: "22%",
        transform: "translateY(-50%)",
        paddingRight: "1.5rem",
        fontSize: "clamp(12pt, 1vw, 15pt)",
        fontFamily: "var(--font-lato)",
        fontWeight: 400,
        color: "#1a3a6b",
        backgroundColor: "rgba(66, 135, 245, 0.06)",
        borderLeft: "2px solid #4287f5",
        borderRadius: "2px",
        padding: "0.5rem 0.75rem",
        lineHeight: 1.45,
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      {text}
    </div>
  );
}

/* ── TL;DR toggle button ── */

function TLDRButton() {
  const { lensActive, toggleLens } = useSummaryLens();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            right: 0,
            paddingBottom: "0.5rem",
            width: "16rem",
            fontSize: "clamp(10pt, 0.85vw, 13pt)",
            fontFamily: "var(--font-lato)",
            fontWeight: 400,
            color: "#1a3a6b",
            backgroundColor: "rgba(66, 135, 245, 0.06)",
            borderLeft: "2px solid #4287f5",
            borderRadius: "2px",
            padding: "0.5rem 0.75rem",
            lineHeight: 1.45,
          }}
        >
          Credit to{" "}
          <a
            href="https://wattenberger.com/thoughts/fish-eye/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#4287f5",
              textDecoration: "underline",
            }}
          >
            Amelia Wattenberger
          </a>
          {" "}for this amazing idea.
        </div>
      )}
      <button
        onClick={toggleLens}
        type="button"
        style={{
          fontSize: "clamp(10pt, 0.9vw, 14pt)",
          fontFamily: "var(--font-lato)",
          fontWeight: 700,
          color: lensActive ? "#fff" : "#4287f5",
          backgroundColor: lensActive
            ? "#4287f5"
            : "var(--background)",
          border: "1.5px solid #4287f5",
          borderRadius: "6px",
          padding: "0.35rem 0.75rem",
          cursor: "pointer",
          letterSpacing: "0.03em",
          transition: "background-color 0.15s ease, color 0.15s ease",
        }}
      >
        TL;DR
      </button>
    </div>
  );
}

/* ── Provider ── */

export function SummaryLensProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lensActive, setLensActive] = useState(false);
  const [activeSummaryText, setActiveSummaryText] = useState<string | null>(
    null
  );

  const toggleLens = useCallback(() => {
    setLensActive((prev) => {
      if (prev) setActiveSummaryText(null);
      return !prev;
    });
  }, []);

  return (
    <SummaryLensContext.Provider
      value={{ lensActive, toggleLens, activeSummaryText, setActiveSummaryText }}
    >
      {children}
      <TLDRButton />
      {lensActive && activeSummaryText && (
        <SummaryBox text={activeSummaryText} />
      )}
    </SummaryLensContext.Provider>
  );
}
