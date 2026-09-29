import type { CSSProperties } from "react";
import type { ShowcaseProduct } from "../types";

type ArtProps = ShowcaseProduct["art"];

export default function ProductArt({ shape, color, scale, width, height }: ArtProps) {
  const style: CSSProperties = {
    ...(color ? { "--c": color } : {}),
    ...(width ? { width: `${width}px` } : {}),
    ...(height ? { height: `${height}px` } : {}),
    ...(scale ? { transform: `scale(${scale})` } : {}),
  };

  return <div className={shape} style={style} />;
}
