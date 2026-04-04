"use client";

import { useState } from "react";
import { img } from "@/lib/imageLoader";

export function Headshot() {
  const [silly, setSilly] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img(silly ? "/drawings/headshot_silly.png" : "/drawings/headshot.png")}
      alt="Allegra"
      className="w-full h-auto"
      style={{ maxWidth: "25vw", cursor: "pointer" }}
      onMouseEnter={() => setSilly(true)}
      onMouseLeave={() => setSilly(false)}
    />
  );
}
