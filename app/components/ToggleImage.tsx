"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function ToggleImage({
  src1,
  src2,
  alt1 = "",
  alt2 = "",
  width,
  height,
  interval = 3000,
}: {
  src1: string;
  src2: string;
  alt1?: string;
  alt2?: string;
  width: number;
  height: number;
  interval?: number;
}) {
  const [showFirst, setShowFirst] = useState(true);
  const hovered = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!hovered.current) setShowFirst((v) => !v);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return (
    <Image
      src={showFirst ? src1 : src2}
      alt={showFirst ? alt1 : alt2}
      width={width}
      height={height}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    />
  );
}
