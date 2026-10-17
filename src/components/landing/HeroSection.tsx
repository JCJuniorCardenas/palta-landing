import Image from 'next/image';
import { ScrollProgress } from '@/components/effects/ScrollProgress';

export function HeroSection() {
  return (
    <ScrollProgress id="hero" className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-[#16231a]">
      <div className="hero-media absolute inset-0">
        <Image src="https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=1800&q=80" alt="Paltas Hass maduras, una de ellas cortada al medio" fill sizes="100vw" priority className="object-cover object-[center_40%]" />
      </div>

      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(8,16,10,0.55)_0%,rgba(8,16,10,0.25)_30%,rgba(8,16,10,0.88)_100%),linear-gradient(90deg,rgba(8,16,10,0.55)_0%,rgba(8,16,10,0.2)_55%,rgba(8,16,10,0)_100%)]" />

      <div className="hero-copy absolute inset-x-0 bottom-0 z-20 pb-24 sm:pb-28">
        <div className="section-shell hero-intro px-6 sm:px-10">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.35em] text-[#EDE4D8] drop-shadow-md sm:text-base">Establecimiento Los 108</p>
          <h1 className="max-w-3xl text-balance text-[2.6rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">Paltas de origen, cultivadas con alma.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#F2EEE9] drop-shadow-sm sm:text-xl">Producción orgánica y responsable en Paso de los Libres, Corrientes. Sabor auténtico directo a tu mesa.</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href="#pedido" className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-[#A66A43] px-10 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#8C5734] active:scale-95">
              Hacer un pedido
            </a>
            <a href="#proceso" className="inline-flex min-h-[56px] items-center justify-center rounded-full border-2 border-white/30 bg-white/10 px-10 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
              Ver del árbol a tu mesa
            </a>
          </div>
        </div>
      </div>

      <a href="#sobre" aria-label="Bajar a la siguiente sección" className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/80">
        Deslizá
        <span className="h-10 w-px overflow-hidden bg-white/25">
          <span className="scroll-cue block h-full w-full bg-white" />
        </span>
      </a>
    </ScrollProgress>
  );
}
