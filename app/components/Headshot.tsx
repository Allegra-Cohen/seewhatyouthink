"use client";

import Image from "next/image";
import { useState } from "react";

export function Headshot() {
  const [silly, setSilly] = useState(false);

  return (
    <Image
      src={silly ? "/drawings/headshot_silly.png" : "/drawings/headshot.png"}
      alt="Allegra"
      width={400}
      height={400}
      className="w-full h-auto"
      style={{ maxWidth: "25vw", cursor: "pointer" }}
      onMouseEnter={() => setSilly(true)}
      onMouseLeave={() => setSilly(false)}
    />
  );
}
