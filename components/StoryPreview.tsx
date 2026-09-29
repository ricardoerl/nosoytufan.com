"use client";

import { useEffect, useRef, useState } from "react";
import { canvasToBlob, renderStory, type StoryOptions } from "@/lib/story/render";

interface Props {
  options: StoryOptions;
  label: string;
  onBlob: (blob: Blob | null) => void;
}

/** Pinta la story en un canvas oculto y muestra el PNG resultante: la vista previa es la imagen real. */
export function StoryPreview({ options, label, onBlob }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const key = JSON.stringify(options);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    (async () => {
      await renderStory(canvas, JSON.parse(key) as StoryOptions);
      const blob = await canvasToBlob(canvas);
      if (cancelled) return;
      onBlob(blob);
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key, onBlob]);

  return (
    <div className="aspect-[9/16] w-[220px] border-3 border-chalk bg-ink shadow-[10px_10px_0_#F4F1EA] md:w-[405px]">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- blob local generado en el cliente
        <img src={url} alt={label} className="block size-full" />
      )}
    </div>
  );
}
