"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { img } from "@/lib/imageLoader";

const SPEED = 6; // pixels per frame

// Elements the gumdrop can knock down
const HIT_SELECTOR = "main p, main h1, main h2, main h3, main li, main blockquote, main img, main figure, main hr, main ul, main ol, .left-margin-title, .background-drawing, .drivable-target";

const COLLISION_PADDING = -35; // negative = rects must overlap by this many px before triggering

function rectsOverlapWithPadding(a: DOMRect, b: DOMRect): boolean {
  return (
    a.left < b.right + COLLISION_PADDING &&
    a.right > b.left - COLLISION_PADDING &&
    a.top < b.bottom + COLLISION_PADDING &&
    a.bottom > b.top - COLLISION_PADDING
  );
}

function applyFall(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const fallDistance = window.innerHeight - rect.bottom;
  const rotation = (Math.random() - 0.5) * 30;
  el.style.transition = "transform 1.2s cubic-bezier(0.55, 0, 1, 0.45)";
  el.style.transform = `translateY(${fallDistance}px) rotate(${rotation}deg)`;
}

/**
 * What the gumdrop is for, in words. It used to be a drawing of the four arrow keys,
 * which showed which keys without saying that clicking is what hands them over — people
 * read it as decoration. The sentence says both.
 *
 * Green (`--accent-primary`) and Lato, so it reads as the site's own voice rather than
 * as part of the drawing, and sized in stage units like DrawingLabel below so the two
 * track the gumdrop together. Sits above the gumdrop; the label sits below it.
 */
function DriveHint({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "110%",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s",
        pointerEvents: "none",
        fontFamily: "var(--font-lato), sans-serif",
        fontSize: "calc(11 * var(--u))",
        lineHeight: 1,
        whiteSpace: "nowrap",
        color: "var(--accent-primary)",
      }}
    >
      click to drive with arrow keys
    </div>
  );
}

/**
 * The drawing's name, sitting under it. Same job as the labels on the left-column
 * drawings (see HoverBlob): it says what the thing is without you having to find
 * it with the cursor first. Unlike those, this one is not a link — the gumdrop is
 * a toy, and "mischief" is the only instruction it gets.
 *
 * Sized in stage units so it tracks the gumdrop, whose `size` is also in stage
 * units — deliberately smaller than the left column's labels (17.28), which are
 * navigation and have to be read; this one is an aside. It sits in the 1.6rem gap
 * between the gumdrop and the bottom of the window.
 */
function DrawingLabel({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: 'var(--font-garamond), Garamond, "Times New Roman", serif',
        fontSize: "calc(12 * var(--u))",
        lineHeight: 1,
        whiteSpace: "nowrap",
        color,
        pointerEvents: "none",
      }}
    >
      {label}
    </span>
  );
}

export function DrivableDrawing({
  src,
  size,
  initialLeft,
  initialBottom,
  label,
  labelColor = "#4b830d",
}: {
  src: string;
  size: string;
  initialLeft: string;
  initialBottom: string;
  label?: string;
  labelColor?: string;
}) {
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  // The hint's own visibility, which outlives the hover: see the linger effect below.
  const [hintVisible, setHintVisible] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keysDown = useRef<Set<string>>(new Set());
  const fallenEls = useRef<Set<Element>>(new Set());
  const frameRef = useRef<number>(0);
  const elRef = useRef<HTMLDivElement>(null);
  const drivableRef = useRef<HTMLDivElement>(null);

  // On first click, snapshot the current CSS position into pixel coords
  const handleClick = useCallback(() => {
    if (!active && pos === null && elRef.current) {
      const rect = elRef.current.getBoundingClientRect();
      setPos({ x: rect.left, y: rect.top });
    }
    setActive((a) => !a);
  }, [active, pos]);

  // Key listeners
  // LINGER FOR 5s AFTER THE CURSOR LEAVES, the same as a footnote's margin note
  // (MarginNote.tsx). The hint is a sentence now rather than a picture of four keys, and
  // a sentence that vanishes the instant you move toward the gumdrop is one you have to
  // hover twice to finish reading.
  useEffect(() => {
    if (hovered) {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      setHintVisible(true);
    } else if (hintVisible) {
      hintTimer.current = setTimeout(() => setHintVisible(false), 5000);
    }
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [hovered, hintVisible]);

  useEffect(() => {
    if (!active) return;

    const onDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        keysDown.current.add(e.key);
      }
      if (e.key === "Escape") setActive(false);
    };
    const onUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      keysDown.current.clear();
    };
  }, [active]);

  // Animation loop
  useEffect(() => {
    if (!active || pos === null) return;

    const tick = () => {
      const keys = keysDown.current;
      setPos((p) => {
        if (!p) return p;
        let { x, y } = p;
        if (keys.has("ArrowLeft")) x -= SPEED;
        if (keys.has("ArrowRight")) x += SPEED;
        if (keys.has("ArrowUp")) y -= SPEED;
        if (keys.has("ArrowDown")) y += SPEED;

        // Wrap around screen edges
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (x < -80) x = w;
        if (x > w) x = -80;
        if (y < -80) y = h;
        if (y > h) y = -80;

        return { x, y };
      });

      // Collision detection
      if (drivableRef.current) {
        const gRect = drivableRef.current.getBoundingClientRect();
        const targets = document.querySelectorAll(HIT_SELECTOR);
        targets.forEach((el) => {
          if (fallenEls.current.has(el)) return;
          if (el === drivableRef.current || drivableRef.current?.contains(el)) return;
          const elRect = el.getBoundingClientRect();
          if (elRect.width === 0 && elRect.height === 0) return;
          if (rectsOverlapWithPadding(gRect, elRect)) {
            fallenEls.current.add(el);
            applyFall(el as HTMLElement);
          }
        });
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, pos]);

  // Before activation: render with CSS positioning (same as other drawings)
  if (pos === null) {
    return (
      <div
        ref={elRef}
        className="absolute"
        style={{
          left: initialLeft,
          bottom: initialBottom,
          width: size,
          height: size,
          pointerEvents: "auto",
          cursor: "pointer",
        }}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <DriveHint visible={hintVisible} />
        <img
          src={img(src)}
          alt=""
          className="w-full h-full object-contain opacity-100"
        />
        {label && <DrawingLabel label={label} color={labelColor} />}
      </div>
    );
  }

  // After activation: render with fixed pixel positioning
  return (
    <div
      ref={drivableRef}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: size,
        height: size,
        pointerEvents: "auto",
        cursor: active ? "grab" : "pointer",
        zIndex: 10,
      }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!active && <DriveHint visible={hintVisible} />}
      <img
        src={img(src)}
        alt=""
        className="w-full h-full object-contain opacity-100"
      />
      {/* Gone while it is being driven — same as the arrow-key hint above it. */}
      {label && !active && <DrawingLabel label={label} color={labelColor} />}
    </div>
  );
}
