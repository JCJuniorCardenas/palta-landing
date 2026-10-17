export function ContactSection() {
  return (
    <section id="contacto" className="section-block bg-[#EDE4D8]">
      <div data-reveal className="section-shell">
        <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(130deg,#2F5D3A_0%,#355f40_56%,#2B5235_100%)] px-6 py-8 text-[#FAF9F6] shadow-[0_20px_42px_rgba(31,31,28,0.16)] sm:px-10 sm:py-12">
          <p className="eyebrow !text-[#EDE4D8]">Contacto</p>
          <h2 className="mt-4 max-w-2xl text-balance text-4xl leading-tight sm:text-5xl">Hablemos de tu pedido o distribución.</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#EDE4D8] sm:text-lg">Realizá tus consultas sobre disponibilidad, volumen y entregas directamente por correo electrónico.</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="mailto:murrazzusabrina@gmail.com?subject=Consulta sobre Distribución - Los 108&body=Hola Sabrina,%0D%0A%0D%0AMe contacto porque estoy interesado en obtener más información sobre la distribución de las paltas del Establecimiento Los 108.%0D%0A%0D%0AMis datos de contacto son:%0D%0A-%20Nombre:%20%0D%0A-%20Teléfono:%20%0D%0A%0D%0A¡Muchas%20gracias!"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#A66A43] px-10 py-4 text-base font-bold text-[#FAF9F6] shadow-lg transition-all hover:scale-105 hover:bg-[#8C5734] active:scale-95 sm:w-auto"
            >
              Enviar Email
            </a>
            <span className="text-sm font-medium text-[#EDE4D8] sm:text-base">murrazzusabrina@gmail.com</span>
          </div>
        </div>
      </div>
    </section>
  );
}
