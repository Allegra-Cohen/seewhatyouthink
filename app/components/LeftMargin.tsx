import Image from "next/image";

export function LeftMargin() {
  return (
    <div className="self-stretch px-4 lg:px-0" style={{ marginTop: "-2.5rem", paddingLeft: "max(1rem, 3vw)" }}>
      <h1
        style={{ fontSize: "clamp(1.5rem, 4vw, 4.5rem)", fontFamily: "var(--font-lato)" }}
        className="font-black leading-[0.95] sticky top-2"
      >
        See <br />
        <span className="hidden lg:inline" style={{ marginLeft: "3rem" }} />
        <span className="inline lg:hidden" style={{ marginLeft: "0.5rem" }} />
        what<br />
        <span className="hidden lg:inline" style={{ marginLeft: "13rem" }} />
        <span className="inline lg:hidden" style={{ marginLeft: "1rem" }} />
        you<br />
        <span className="hidden lg:inline" style={{ marginLeft: "8rem" }} />
        <span className="inline lg:hidden" style={{ marginLeft: "0.5rem" }} />
        think
      </h1>
    </div>
  );
}
