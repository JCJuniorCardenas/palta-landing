export function OrganicVisitSection() {
  return (
    <section id="organico" className="section-block bg-[#EDE4D8]">
      <div data-reveal className="section-shell">
        <div className="rounded-[1.5rem] border border-[#d9ccbc] bg-[#FAF9F6] px-5 py-8 sm:px-8 sm:py-10">
          <p className="eyebrow text-[#A66A43]">Producción orgánica y visitas</p>
          <h2 className="mt-4 max-w-3xl text-balance text-4xl leading-tight text-[#2F5D3A] sm:text-5xl">Transparencia total: producción cuidada y campo abierto a visitas.</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#4D443B] sm:text-lg">En Los 108 mostramos cada etapa para que veas de primera mano cómo trabajamos. Si querés visitar el campo, coordinamos fecha por mail.</p>
          <a
            href="mailto:murrazzusabrina@gmail.com?subject=Solicitud de Visita al Campo - Los 108&body=Hola Sabrina,%0D%0A%0D%0AMe gustaría coordinar una visita al establecimiento Los 108 para conocer más sobre la producción de paltas.%0D%0A%0D%0AMis datos de contacto son:%0D%0A-%20Nombre:%20%0D%0A-%20Fecha%20estimada:%20%0D%0A%0D%0A¡Muchas%20gracias!"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#2F5D3A] px-10 py-4 text-base font-bold text-[#FAF9F6] shadow-lg transition-all hover:scale-105 hover:bg-[#244B2E] active:scale-95"
          >
            Coordinar visita al campo
          </a>
        </div>
      </div>
    </section>
  );
}
