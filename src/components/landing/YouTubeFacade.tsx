'use client';

import Image from 'next/image';
import { useState } from 'react';

type YouTubeFacadeProps = {
  videoId: string;
  title: string;
};

/** Muestra la miniatura y recién carga el iframe de YouTube al hacer clic (evita 3 iframes pesados al abrir la página). */
export function YouTubeFacade({ videoId, title }: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`Reproducir video: ${title}`} className="group relative block h-full w-full overflow-hidden bg-[#16231a]">
      <Image src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#A66A43] text-white shadow-xl transition-transform group-hover:scale-110">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" />
        </svg>
      </span>
    </button>
  );
}
