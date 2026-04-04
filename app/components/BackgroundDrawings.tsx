"use client";

import Link from "next/link";
import { HoverBlob } from "./HoverBlob";
import { img } from "@/lib/imageLoader";

// All units in vw. Bottom values converted from vh% assuming 1440×900 reference:
// bottom_vw = bottom_pct × (900/1440) = bottom_pct × 0.625
const DRAWINGS = [
  { src: "/drawings/rubber_plant.png", size: "13vw", left: "-1vw", bottom: "28vw", blob: { color: "#4b830d", index: 0, label: "home" }, href: "/" },
  { src: "/drawings/gumdrop_purple.png", size: "3.5vw", left: "10vw", bottom: "27vw", blob: null, href: null },
  { src: "/drawings/string.png", size: "15vw", left: "10vw", bottom: "9.4vw", blob: null, href: null },
  { src: "/drawings/bush.png", size: "8vw", left: "18vw", bottom: "2.25vw", blob: null, href: null },
  { src: "/drawings/oracle.png", size: "15vw", left: "0vw", bottom: "0.6vw", blob: null, href: null },
  { src: "/drawings/statue.png", size: "12vw", left: "1vw", bottom: "14.6vw", blob: { color: "#7346cf", index: 0, label: "about" }, href: "/about" },
  { src: "/drawings/gumdrop_red.png", size: "3vw", left: "14vw", bottom: "1.1vw", blob: null, href: null },
  { src: "/drawings/gumdrop_green.png", size: "3.5vw", left: "75vw", bottom: "2.4vw", blob: null, href: null },
  { src: "/drawings/eye.png", size: "8.5vw", left: "15vw", bottom: "45vw", blob: null, href: null },
];

export function BackgroundDrawings() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {DRAWINGS.map(({ src, size, left, bottom, blob, href }) => {
        const image = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img(src)}
            alt=""
            className="w-full h-full object-contain opacity-50"
          />
        );

        const interactive = blob || href;

        let content = image;
        if (blob) {
          content = (
            <HoverBlob color={blob.color} blobIndex={blob.index} label={blob.label}>
              {href ? <Link href={href} className="block w-full h-full">{image}</Link> : image}
            </HoverBlob>
          );
        } else if (href) {
          content = <Link href={href} className="block w-full h-full">{image}</Link>;
        }

        return (
          <div
            key={src}
            className="absolute"
            style={{ left, bottom, width: size, height: size, pointerEvents: interactive ? "auto" : "none", overflow: "visible" }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
