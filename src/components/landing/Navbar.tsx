'use client';

import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '#sobre', label: 'Historia' },
  { href: '#proceso', label: 'Del árbol a tu mesa' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#maduracion', label: 'Maduración' },
  { href: '#recetas', label: 'Recetas' },
  { href: '#ubicacion', label: 'Ubicación' },
];

export function Navbar() {
  const barRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      barRef.current?.style.setProperty('transform', `scaleX(${progress.toFixed(4)})`);
      setScrolled(window.scrollY > 40);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${solid ? 'bg-[#FAF9F6]/90 shadow-[0_1px_0_rgba(47,93,58,0.12)] backdrop-blur-lg' : 'bg-transparent'}`}>
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-10">
        <a href="#hero" onClick={() => setOpen(false)} className={`font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight transition-colors ${solid ? 'text-[#2F5D3A]' : 'text-white'}`}>
          Los 108
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={`text-sm font-semibold transition-colors ${solid ? 'text-[#4F473E] hover:text-[#2F5D3A]' : 'text-white/85 hover:text-white'}`}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href="#pedido" className="hidden min-h-10 items-center rounded-full bg-[#A66A43] px-5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#8C5734] active:scale-95 sm:inline-flex">
            Pedir paltas
          </a>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((value) => !value)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden ${solid ? 'text-[#2F5D3A]' : 'text-white'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-movil" className="border-t border-[#EDE4D8] bg-[#FAF9F6] px-5 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="block border-b border-[#EDE4D8] py-3.5 text-base font-semibold text-[#2F5D3A]">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#pedido" onClick={() => setOpen(false)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#A66A43] text-base font-bold text-white">
            Hacer un pedido
          </a>
        </div>
      )}

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-transparent">
        <div ref={barRef} className="h-full origin-left bg-[#A66A43]" style={{ transform: 'scaleX(0)' }} />
      </div>
    </header>
  );
}
