import { useEffect, useState } from "react";

export function useDragPreviewImage(fileName: string) {
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const width = 140;
    const height = 40;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, width, height);
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let text = fileName || "No Name";
      const maxLen = 18;
      if (text.length > maxLen) {
        text = text.slice(0, maxLen - 3) + "...";
      }
      ctx.fillText(text, width / 2, height / 2);
      setPreviewSrc(canvas.toDataURL());
    }
  }, [fileName]);

  return previewSrc;
}
