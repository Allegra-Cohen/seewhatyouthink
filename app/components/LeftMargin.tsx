import Image from "next/image";

export function LeftMargin() {
  return (
    <div className="self-stretch pb-10" style={{ marginTop: "-2.5rem", paddingLeft: "2rem" }}>
      <h1
        style={{ fontSize: "clamp(2.5rem, 4vw, 4.5rem)", fontFamily: "var(--font-lato)" }}
        className="font-black leading-[0.95] sticky top-2"
      >
        See <br /><span style={{ marginLeft: "3rem" }}/>what<br /><span style={{ marginLeft: "13rem" }}/>you<br /><span style={{ marginLeft: "8rem" }}/>think
      </h1>
    </div>
  );
}
