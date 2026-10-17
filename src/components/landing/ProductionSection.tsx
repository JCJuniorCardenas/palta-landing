import { CountUp } from '@/components/effects/CountUp';

const nutrients = [
  { value: 160, unit: 'kcal', label: 'Energía' },
  { value: 2, unit: 'g', label: 'Proteínas' },
  { value: 15, unit: 'g', label: 'Grasas saludables' },
  { value: 7, unit: 'g', label: 'Fibra' },
  { value: 9, unit: 'g', label: 'Carbohidratos' },
];

const productionHighlights = [
  {
    title: 'Vitaminas y Minerales',
    description: 'Fuente de Vitamina K, C, B5, B6, E y más Potasio que una banana.',
  },
  {
    title: 'Beneficios Saludables',
    description: 'Ayuda al corazón, reduce el colesterol y es excelente para la vista.',
  },
];

export function ProductionSection() {
  return (
    <section id="beneficios" className="section-block bg-[#EDE4D8]">
      <div className="section-shell">
        <p data-reveal className="eyebrow text-[#A66A43]">Superalimento</p>
        <h2 data-reveal="1" className="mt-4 max-w-4xl text-balance text-5xl font-bold leading-[1.1] text-[#2F5D3A] sm:text-7xl">Beneficios Nutricionales</h2>
        <p data-reveal="2" className="mt-6 max-w-2xl text-lg leading-relaxed text-[#4D443B] sm:text-xl">
          La palta de <strong>Los 108</strong> es 100% natural, sin químicos agresivos, directo de la planta a tu mesa.
        </p>

        <p data-reveal className="mt-14 text-sm font-bold uppercase tracking-[0.2em] text-[#6E9A6C]">Nutrientes cada 100 g</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {nutrients.map((item, index) => (
            <div key={item.label} data-reveal={String(Math.min(index + 1, 5))} className="last:col-span-2 sm:last:col-span-1">
              <div className="rounded-[1.35rem] border border-[#d9ccbc] bg-[#FAF9F6] p-5 shadow-[0_14px_34px_rgba(47,93,58,0.08)]">
                <p className="font-[family-name:var(--font-display)] text-5xl font-bold leading-none text-[#2F5D3A] sm:text-6xl">
                  <CountUp to={item.value} />
                  <span className="ml-1 text-2xl text-[#A66A43] sm:text-3xl">{item.unit}</span>
                </p>
                <p className="mt-3 text-sm font-semibold text-[#4D443B]">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {productionHighlights.map((item, index) => (
            <div key={item.title} data-reveal={String(index + 1)}>
              <article className="h-full rounded-[1.35rem] border border-[#d9ccbc] bg-[#FAF9F6] p-6 shadow-[0_14px_34px_rgba(47,93,58,0.08)] transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-bold leading-snug text-[#2F5D3A]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4D443B] sm:text-base">{item.description}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
