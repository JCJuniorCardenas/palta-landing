'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type ScrollProgressProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Escribe `--p` (0 → 1) en el <section> según cuánto salió de pantalla por arriba.
 * El CSS usa esa variable para el parallax, sin re-renderizar React en cada scroll.
 */
export function ScrollProgress({ id, className, children }: ScrollProgressProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const { top, height } = el.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -top / Math.max(1, height)));
      el.style.setProperty('--p', progress.toFixed(4));
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

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
