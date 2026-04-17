"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { img } from "@/lib/imageLoader";

const SPEED = 6; // pixels per frame

// Elements the gumdrop can knock down
const HIT_SELECTOR = "main p, main h1, main h2, main h3, main li, main blockquote, main img, main figure, main hr, main ul, main ol, .left-margin-title, .background-drawing";

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

function ArrowKeysHint({ visible }: { visible: boolean }) {
  const key = (label: string) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        border: "1px solid #4b830d",
        borderRadius: 5,
        fontSize: 20,
        lineHeight: 1,
        color: "#4b830d",
        background: "rgba(255,248,237,0.9)",
      }}
    >
      {label}
    </span>
  );

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {key("\u2191")}
      <div style={{ display: "flex", gap: 2 }}>
        {key("\u2190")}
        {key("\u2193")}
        {key("\u2192")}
      </div>
    </div>
  );
}

export function DrivableDrawing({
  src,
  size,
  initialLeft,
  initialBottom,
}: {
  src: string;
  size: string;
  initialLeft: string;
  initialBottom: string;
}) {
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
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
        <ArrowKeysHint visible={hovered} />
        <img
          src={img(src)}
          alt=""
          className="w-full h-full object-contain opacity-50"
        />
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
      {!active && <ArrowKeysHint visible={hovered} />}
      <img
        src={img(src)}
        alt=""
        className={`w-full h-full object-contain ${active ? "opacity-80" : "opacity-50"}`}
      />
    </div>
  );
}
