import type { VideoHTMLAttributes } from "react";

// Demo clips embed as autoplaying, looping, muted video by default (like a
// silent GIF). Pass `controls` to show a player instead. Styled to match the
// Img component in mdx-components.tsx so media sits centered in the column.
export function Video({
  src,
  controls = false,
  style,
  ...rest
}: VideoHTMLAttributes<HTMLVideoElement> & { src: string }) {
  return (
    <video
      src={src}
      autoPlay={!controls}
      loop={!controls}
      muted
      playsInline
      controls={controls}
      preload="metadata"
      style={{
        display: "block",
        margin: "2.5rem auto",
        maxWidth: "100%",
        height: "auto",
        borderRadius: "4px",
        ...style,
      }}
      {...rest}
    />
  );
}
