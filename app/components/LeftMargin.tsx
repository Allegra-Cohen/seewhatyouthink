import Link from "next/link";
import { img } from "@/lib/imageLoader";

export function LeftMargin() {
  return (
    <>
      {/* Desktop: vertical stacked title in left column */}
      <div className="hidden lg:block self-stretch" style={{ marginTop: "-2.5rem", paddingLeft: "max(1rem, 3vw)" }}>
        <h1
          style={{ fontSize: "clamp(2.5rem, 4vw, 4.5rem)", fontFamily: "var(--font-lato)" }}
          className="font-black leading-[0.95] sticky top-2"
        >
          See <br />
          <span style={{ marginLeft: "3rem" }} />what<br />
          <span style={{ marginLeft: "13rem" }} />you<br />
          <span style={{ marginLeft: "8rem" }} />think
        </h1>
      </div>

      {/* Mobile: horizontal title with eye drawing */}
      <div className="flex lg:hidden items-center gap-3 px-4 pt-4 pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img("/drawings/eye.png")}
          alt=""
          className="opacity-50"
          style={{ width: "3rem", height: "3rem", objectFit: "contain" }}
        />
        <h1
          style={{ fontFamily: "var(--font-lato)", fontSize: "1.4rem" }}
          className="font-black leading-[1.1]"
        >
          see what<br />you think
        </h1>
        <div className="ml-auto flex gap-4" style={{ fontFamily: "var(--font-lato)", fontSize: "0.85rem", fontWeight: 700 }}>
          <Link href="/" className="hover:text-accent transition-colors">home</Link>
          <Link href="/about" className="hover:text-accent transition-colors">about me</Link>
        </div>
      </div>
    </>
  );
}
