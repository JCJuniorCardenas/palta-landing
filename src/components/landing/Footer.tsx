const quickLinks = [
  { href: '#sobre', label: 'Historia' },
  { href: '#proceso', label: 'Del árbol a tu mesa' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#recetas', label: 'Recetas' },
  { href: '#contacto', label: 'Contacto' },
];

export function Footer() {
  return (
    <footer className="bg-[#16231a] px-6 pb-28 pt-14 text-[#EDE4D8] sm:px-16">
      <div className="section-shell grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">Los 108</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#EDE4D8]/80">Paltas de origen, cultivadas con alma. Producción orgánica y responsable en Paso de los Libres, Corrientes.</p>
        </div>

        <nav aria-label="Pie de página">
          <p className="eyebrow !text-[#EDE4D8]/70">Explorar</p>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow !text-[#EDE4D8]/70">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Colón 1707, Paso de los Libres, Corrientes</li>
            <li>
              <a href="mailto:murrazzusabrina@gmail.com" className="transition-colors hover:text-white">
                murrazzusabrina@gmail.com
              </a>
            </li>
            <li>
              <a href="https://wa.me/5493795039055" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                WhatsApp +54 9 3795 039055
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="section-shell mt-12 border-t border-white/10 pt-6 text-xs text-[#EDE4D8]/60">© Establecimiento Los 108. Todos los derechos reservados.</p>
    </footer>
  );
}
