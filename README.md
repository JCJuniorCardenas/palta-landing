# Los 108 - Landing Page

Landing page informativa y de contacto para **Los 108**, un establecimiento de producción orgánica de paltas ubicado en Paso de los Libres, Corrientes, Argentina.

## Sobre el proyecto

Los 108 es una finca familiar dedicada al cultivo responsable y orgánico de paltas de alta calidad. Esta landing page funciona como vitrina digital y canal de contacto para clientes y potenciales distribuidores.

**Objetivo**: Presentar la marca, el proceso de producción, beneficios nutricionales, recetas y facilitar canales de contacto directo (email y WhatsApp).

## Características

- 📱 **Diseño responsive** adaptado a mobile, tablet y desktop
- 🎨 **Branding consistente** con identidad visual clara y memorable
- 📍 **Ubicación interactiva** con Google Maps embebido
- 📹 **Sección de recetas** con videos de YouTube integrados
- ⭐ **Testimonios de clientes** para generar confianza
- 📧 **Múltiples canales de contacto** (email directo, WhatsApp flotante, coordinación de visitas)
- 🔍 **SEO básico** con metadata y Open Graph configurados
- ♿ **Accesibilidad** considerada (semantic HTML, ARIA labels, navegación intuitiva)
- ⚡ **Performance optimizado** con imágenes lazy-loaded e iframes demorados

## Tecnologías

- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos utility-first
- **next/image** - Optimización de imágenes
- **next/font** - Carga de tipografías (Manrope y Fraunces)
- **PostCSS** - Procesamiento CSS

## Estructura del proyecto

```
palta-landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout raíz con metadata global, navbar y efectos
│   │   ├── page.tsx            # Página principal (Home)
│   │   └── globals.css         # Estilos globales, reveal y efectos de scroll
│   ├── content/
│   │   └── story.ts            # Escenas (fotos + textos) de "Del árbol a tu mesa"
│   └── components/
│       ├── effects/
│       │   ├── ScrollEffects.tsx   # Reveal: anima todo lo que tenga data-reveal
│       │   ├── ScrollProgress.tsx  # Escribe --p (0→1) para el parallax del hero
│       │   └── CountUp.tsx         # Números que cuentan al entrar en pantalla
│       └── landing/
│           ├── Navbar.tsx          # Navbar fija + barra de progreso de scroll
│           ├── HeroSection.tsx
│           ├── AboutSection.tsx
│           ├── StorySection.tsx    # Scrollytelling sticky (origen → mesa)
│           ├── ProductionSection.tsx
│           ├── ConservationSection.tsx
│           ├── RecipesSection.tsx
│           ├── YouTubeFacade.tsx   # Miniatura + carga del video al hacer clic
│           ├── ReviewsSection.tsx
│           ├── OrganicVisitSection.tsx
│           ├── LocationSection.tsx
│           ├── ContactSection.tsx
│           ├── Footer.tsx
│           └── FloatingWhatsAppButton.tsx
├── public/
│   └── img/                    # Imágenes locales
├── package.json
├── next.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

## Instalación y desarrollo

### Requisitos previos
- Node.js 18+
- npm, yarn o pnpm

### Instalación

```bash
npm install
```

### Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para producción

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Decisiones técnicas

### Componentización
La landing está dividida en componentes reutilizables por sección. Cada componente es independiente y responsable de renderizar su parte específica del contenido.

### Next.js App Router
Se utiliza el nuevo App Router (App Directory) de Next.js 16 para mejor performance y escalabilidad, junto con Server Components por defecto.

### next/image y next/font
- **next/image**: Optimización automática de imágenes, lazy loading, y soporte responsive
- **next/font**: Carga optimizada de tipografías Google con integración directa

### Tailwind CSS v4
Estilos basados en utilities con tokens de color centralizados en CSS variables. Se evita la sobrecarga de clases mediante patrones consistentes.

### SEO Base
- Metadata global configurada (title, description, Open Graph, Twitter Card)
- Semantic HTML (`<section>`, `<article>`, `<h1>`, etc.)
- Alt text descriptivo en imágenes
- lang="es" en raíz HTML

### Accesibilidad
- Navegación semántica
- aria-label en elementos interactivos cuando corresponde
- Contraste de colores considerado en la paleta
- Formularios con enlaces mailto (no requiere JavaScript)

## Secciones de la landing

1. **Hero** - Presentación a pantalla completa con parallax al scroll
2. **About** - Historia y valores de Los 108
3. **Story** - "Del árbol a tu mesa": origen, selección, cosecha, acondicionamiento (scrollytelling)
4. **Production** - Beneficios nutricionales con números animados
5. **Conservation** - Guía de maduración y almacenamiento
6. **Recipes** - Recetas con videos (cargan al hacer clic)
7. **Reviews** - Testimonios de clientes
8. **Organic Visit** - Invitación a visitas del campo
9. **Location** - Ubicación con Google Maps
10. **Contact** - Sección de contacto por email
11. **Footer** y **Floating WhatsApp**

## Scroll y animaciones

- **Reveal**: cualquier elemento con `data-reveal` (o `data-reveal="1"`…`"5"` para escalonar) aparece al entrar en pantalla. Sin JavaScript o con "reducir movimiento" activado, se muestra sin animar.
- **Scrollytelling**: en `StorySection` la foto queda fija y hace crossfade mientras las tarjetas de texto suben por encima; los puntos de la derecha permiten saltar a cada escena.
- **Parallax del hero**: `ScrollProgress` escribe `--p` y el CSS mueve la imagen y desvanece el texto, sin re-renderizar React.
- Sin librerías de animación: todo con CSS, `IntersectionObserver` y `requestAnimationFrame`.

### Cambiar las fotos del scrollytelling

Editá `src/content/story.ts`. Dejá tu foto en `public/img/story/` y poné `image: '/img/story/tu-foto.jpg'`. Funcionan mejor las fotos horizontales de al menos 1600 px de ancho. Las escenas marcadas `PROVISORIA` usan fotos de stock y hay que reemplazarlas por fotos reales del campo.

## Estado del proyecto

**Fase**: MVP informativo terminado y listo para deploy.

El proyecto está completo para su función principal: presentar la marca Los 108 y facilitar canales de contacto. Está optimizado para performance, accesibilidad y responsive design.

## Contacto

Para consultas, pedidos o visitas al campo:
- 📧 Email: murrazzusabrina@gmail.com
- 💬 WhatsApp: +54 9 3795 039055
- 📍 Ubicación: Colón 1707, Paso de los Libres, Corrientes

---

Desarrollado con ❤️ para Los 108.
