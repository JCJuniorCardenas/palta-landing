'use client';

import { useEffect } from 'react';

/**
 * Observa todos los elementos con `data-reveal` y les agrega `data-in`
 * cuando entran en pantalla. El CSS (globals.css) hace la animación.
 * Se monta una sola vez en el layout; las secciones siguen siendo Server Components.
 */
export function ScrollEffects() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-in', '');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
