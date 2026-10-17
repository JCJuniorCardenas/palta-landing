const reviews = [
  {
    name: 'Carlos M.',
    role: 'Cliente Local',
    content: 'La cremosidad de estas paltas es de otro planeta. Se nota mucho la diferencia cuando es orgánica y de maduración natural.',
    stars: 5,
  },
  {
    name: 'Sofía R.',
    role: 'Chef de Restaurante',
    content: 'Excelente calidad para mis platos. El contenido de aceite es perfecto y se mantienen muy bien.',
    stars: 5,
  },
  {
    name: 'Martín G.',
    role: 'Visitante del Campo',
    content: 'Visitar el campo Los 108 fue una experiencia increíble. Ver cómo cuidan cada árbol explica la calidad del producto final.',
    stars: 5,
  },
];

export function ReviewsSection() {
  return (
    <section id="comentarios" className="section-block bg-[#FAF9F6]">
      <div className="section-shell">
        <p data-reveal className="eyebrow text-[#A66A43]">Nuestros Clientes</p>
        <h2 data-reveal="1" className="mt-4 max-w-4xl text-balance text-5xl font-bold leading-[1.1] text-[#2F5D3A] sm:text-7xl">Experiencias Los 108</h2>
        <p data-reveal="2" className="mt-6 max-w-2xl text-lg leading-relaxed text-[#4D443B] sm:text-xl">Lo que dicen quienes ya prueban el sabor real de nuestras paltas orgánicas.</p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {reviews.map((review, index) => (
            <div key={review.name} data-reveal={String(index + 1)}>
              <article className="h-full rounded-3xl border border-[#d9ccbc] bg-[#EDE4D8] p-8 shadow-sm transition-transform duration-300 hover:-translate-y-2">
                <div className="mb-4 flex gap-1" aria-label={`${review.stars} de 5 estrellas`}>
                  {Array.from({ length: review.stars }, (_, i) => (
                    <span key={i} aria-hidden="true" className="text-xl text-[#A66A43]">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-6 text-lg italic leading-relaxed text-[#2F5D3A]">&quot;{review.content}&quot;</p>
                <div className="border-t border-[#d9ccbc] pt-4">
                  <p className="font-bold text-[#2F5D3A]">{review.name}</p>
                  <p className="text-sm font-medium text-[#6E9A6C]">{review.role}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
