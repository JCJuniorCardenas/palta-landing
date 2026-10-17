export function LocationSection() {
  return (
    <section id="ubicacion" className="section-block bg-[#FAF9F6]">
      <div className="section-shell">
        <p data-reveal className="eyebrow text-[#A66A43]">Ubicación</p>
        <h2 data-reveal="1" className="mt-4 text-balance text-4xl leading-tight text-[#2F5D3A] sm:text-5xl">Paso de los Libres, Corrientes.</h2>
        <p data-reveal="2" className="mt-4 max-w-2xl text-base leading-relaxed text-[#4D443B] sm:text-lg">Nos encontrás en Colón 1707, Paso de los Libres, Corrientes. Coordinamos visitas y entregas con cita previa.</p>

        <div data-reveal="3" className="mt-8">
          <div className="overflow-hidden rounded-[1.2rem] border border-[#D3C6B7] bg-[#EDE4D8] shadow-[0_14px_34px_rgba(47,93,58,0.08)]">
            <iframe title="Mapa del campo Los 108 en Paso de los Libres, Corrientes" src="https://www.google.com/maps?q=Colon+1707,+Paso+de+los+Libres,+Corrientes,+Argentina&output=embed" className="h-72 w-full sm:h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </div>
    </section>
  );
}
