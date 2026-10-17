import Image from 'next/image';

export function AboutSection() {
  return (
    <section id="sobre" className="section-block bg-[#FAF9F6]">
      <div className="section-shell">
        <p data-reveal className="eyebrow">Nuestra Historia</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 data-reveal="1" className="text-balance text-4xl font-bold leading-tight text-[#2F5D3A] sm:text-5xl lg:text-6xl">Una finca familiar con raíces en el litoral.</h2>
            <p data-reveal="2" className="mt-8 text-lg leading-relaxed text-[#4F473E] sm:text-xl">
              En <strong>Establecimiento Los 108</strong>, en Paso de los Libres, Corrientes, cultivamos con paciencia y respeto por la tierra. Nuestras prácticas agrícolas orgánicas priorizan la salud del suelo y la calidad de cada palta.
            </p>
            <div data-reveal="3" className="mt-10 flex flex-wrap gap-6 border-t border-[#EDE4D8] pt-10">
              <div className="min-w-[140px] flex-1">
                <p className="text-3xl font-bold text-[#A66A43]">100%</p>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#6E9A6C]">Orgánico</p>
              </div>
              <div className="min-w-[140px] flex-1">
                <p className="text-3xl font-bold text-[#A66A43]">+ Aceite</p>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#6E9A6C]">Calidad Premium</p>
              </div>
            </div>
          </div>
          <div data-reveal="2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
              <Image src="/img/palta1.jpg" alt="Paltas de Establecimiento Los 108" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
