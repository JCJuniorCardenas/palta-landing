import Image from 'next/image';

const ripeningSteps = [
  {
    status: 'Dura (Verde)',
    action: 'Dejar a temperatura ambiente. Para acelerar, poner junto a una banana o manzana.',
    image: '/img/palta-verde.jfif',
  },
  {
    status: 'Blanda (Al punto)',
    action: 'Presionala suavemente. Si cede con suavidad, está lista. Guardar en la heladera.',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
  },
  {
    status: 'Congelado',
    action: 'Picar o procesar con gotas de limón y guardar en porciones en el freezer.',
    image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=600&q=80',
  },
];

export function ConservationSection() {
  return (
    <section id="maduracion" className="section-block bg-[#FAF9F6]">
      <div className="section-shell">
        <p data-reveal className="eyebrow text-[#A66A43]">Guía Práctica</p>
        <h2 data-reveal="1" className="mt-4 max-w-4xl text-balance text-5xl font-bold leading-[1.1] text-[#2F5D3A] sm:text-7xl">Maduración y Conservación</h2>
        <p data-reveal="2" className="mt-6 max-w-2xl text-lg leading-relaxed text-[#4D443B] sm:text-xl">Te guiamos para que disfrutes tu palta en las mejores condiciones.</p>

        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ripeningSteps.map((step, index) => (
            <div key={step.status} data-reveal={String(index + 1)}>
              <article className="group h-full overflow-hidden rounded-2xl border border-[#d9ccbc] bg-[#EDE4D8] shadow-sm transition-all hover:shadow-md">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image src={step.image} alt={step.status} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#2F5D3A]">{step.status}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#443C34] sm:text-base">{step.action}</p>
                </div>
              </article>
            </div>
          ))}
        </div>

        <div data-reveal className="mt-16">
          <div className="overflow-hidden rounded-[2rem] bg-[#EDE4D8] shadow-xl">
            <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
              <Image src="/img/palta-estado.webp" alt="Diferentes estados de maduración de la palta" fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-contain p-4" />
            </div>
            <div className="bg-[#2F5D3A] p-8 text-center text-[#FAF9F6]">
              <h3 className="text-2xl font-bold italic sm:text-3xl">Guía para saber en qué etapa de maduración se encuentra la palta</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
