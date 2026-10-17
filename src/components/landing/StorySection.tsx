'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Scene } from '@/content/story';

type StorySectionProps = {
  scenes: Scene[];
};

/**
 * Scrollytelling: la imagen queda fija (sticky) y hace crossfade mientras
 * las tarjetas de texto suben por encima. La tarjeta que cruza el centro
 * de la pantalla define qué imagen se ve.
 */
export function StorySection({ scenes }: StorySectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // Progreso 0 → 1 de toda la sección: alimenta el zoom lento de las fotos
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const { top, height } = root.getBoundingClientRect();
      const range = Math.max(1, height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -top / range));
      root.style.setProperty('--p', progress.toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Escena activa: la tarjeta que cruza la franja central de la pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    stepRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section id="proceso" ref={rootRef} aria-label="Del árbol a tu mesa" className="relative bg-[#16231a] text-[#FAF9F6]">
      {/* Escenario fijo con las fotos */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {scenes.map((scene, index) => (
          <div key={scene.id} data-active={active === index} aria-hidden={active !== index} className="story-layer absolute inset-0">
            <Image src={scene.image} alt={scene.alt} fill sizes="100vw" className="story-image object-cover" style={{ objectPosition: scene.focus }} />
          </div>
        ))}

        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/40 sm:bg-linear-to-r sm:from-black/75 sm:via-black/30 sm:to-black/10" />

        <p className="eyebrow absolute left-6 top-24 !text-[#EDE4D8] sm:left-16">Del árbol a tu mesa</p>

        <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-8">
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir a ${scene.eyebrow}`}
              aria-current={active === index}
              className="group flex h-6 w-6 items-center justify-center"
            >
              <span className={`block rounded-full transition-all duration-500 ${active === index ? 'h-3 w-3 bg-[#EDE4D8]' : 'h-2 w-2 bg-white/40 group-hover:bg-white/80'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de texto: suben por encima del escenario fijo */}
      <div className="relative z-10 -mt-[100svh]">
        {scenes.map((scene, index) => (
          <article
            key={scene.id}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            data-index={index}
            data-active={active === index}
            className="story-card flex min-h-svh items-end px-5 pb-16 sm:items-center sm:px-16 sm:pb-0"
          >
            <div className="max-w-md rounded-3xl border border-white/15 bg-black/35 p-7 shadow-2xl backdrop-blur-md sm:p-9">
              <p className="eyebrow !text-[#EDE4D8]">
                {String(index + 1).padStart(2, '0')} · {scene.eyebrow}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-4xl">{scene.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-[#F2EEE9] sm:text-lg">{scene.body}</p>
              {index === scenes.length - 1 && (
                <a href="#contacto" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#A66A43] px-8 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#8C5734] active:scale-95">
                  Hacer un pedido
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
