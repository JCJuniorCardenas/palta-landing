# Los 108 - Landing Page

Landing page, tienda de pedidos y panel de administración de **Los 108**, un establecimiento de producción orgánica de paltas ubicado en Paso de los Libres, Corrientes, Argentina.

## Sobre el proyecto

Los 108 es una finca familiar dedicada al cultivo responsable y orgánico de paltas de alta calidad. El sitio presenta la marca, permite **hacer pedidos online** (pago con Mercado Pago o transferencia) y le da al dueño un **panel `/admin`** para ver cuántos pedidos pagados hay, cuántos kilos se vendieron y cuánto dinero ingresó.

**Objetivo**: Presentar la marca, el proceso de producción, beneficios nutricionales y recetas, vender cajas de paltas y llevar el control de las ventas.

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
- **PostgreSQL** (driver `pg`) - Pedidos y productos; en tu PC se usa una base embebida (`@electric-sql/pglite`)
- **Mercado Pago** (Checkout Pro, por API REST) - Cobro online

## Estructura del proyecto

```
palta-landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout raíz con metadata global, navbar y efectos
│   │   ├── page.tsx            # Página principal (Home)
│   │   ├── globals.css         # Estilos globales, reveal y efectos de scroll
│   │   ├── api/
│   │   │   ├── products/       # Catálogo público
│   │   │   ├── orders/         # Crear pedido (valida, calcula total, arma el cobro)
│   │   │   └── webhooks/mercadopago/  # Aviso de pagos de Mercado Pago
│   │   ├── pedido/[code]/      # Seguimiento del pedido (vuelta de Mercado Pago)
│   │   └── admin/              # Panel del dueño: login, resumen, pedidos, productos
│   ├── lib/                    # db, esquema, pedidos, estadísticas, Mercado Pago, auth, validación
│   ├── content/
│   │   └── story.ts            # Escenas (fotos + textos) de "Del árbol a tu mesa"
│   └── components/
│       ├── effects/
│       │   ├── ScrollEffects.tsx   # Reveal: anima todo lo que tenga data-reveal
│       │   ├── ScrollProgress.tsx  # Escribe --p (0→1) para el parallax del hero
│       │   └── CountUp.tsx         # Números que cuentan al entrar en pantalla
│       ├── admin/              # Gráfico de barras, tarjeta de pedido, formularios del panel
│       └── landing/
│           ├── OrderSection.tsx    # Formulario de pedido (tienda)
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

## Pedidos, pagos y panel de administración

### Cómo funciona

1. El cliente elige cajas en la sección **Pedí online** (`#pedido`), completa sus datos y paga con **Mercado Pago** o elige **transferencia**.
2. El servidor calcula el total con los precios de la base de datos (nunca confía en lo que manda el navegador), descuenta stock si el producto lo controla y registra el pedido como `pending` (pendiente de pago).
3. **Mercado Pago:** el cliente paga en Mercado Pago y vuelve a `/pedido/CODIGO`. El pedido pasa a `paid` cuando Mercado Pago lo confirma, ya sea por el aviso (webhook) o al volver. Siempre se consulta el pago directamente a Mercado Pago y se verifica que sea aprobado, del pedido correcto y por el monto exacto.
4. **Transferencia:** el cliente coordina el pago por WhatsApp y el dueño aprieta **Confirmar pago** en el panel.
5. Estados: `pending` → `paid` → `delivered`, o `cancelled` (devuelve el stock).

El dashboard **solo cuenta pedidos pagados o entregados** (por fecha de pago, hora de Argentina). Los pendientes se muestran aparte, como "por cobrar".

### Panel de administración

- `/admin` — Resumen: ingresos, pedidos pagados, kilos vendidos, ticket promedio, pendientes de pago, por entregar, gráficos por día (con vista de tabla), productos más vendidos y últimos pedidos. Se actualiza solo cada 30 segundos.
- `/admin/pedidos` — Todos los pedidos con filtro por estado y acciones (confirmar pago, marcar entregado, cancelar).
- `/admin/productos` — Nombre, kilos por unidad, precio, stock opcional y si se ve en la tienda. Los precios y productos se cambian acá, sin tocar código.

Es para **una sola persona** (el dueño), con contraseña. Tras 5 intentos fallidos se bloquea 15 minutos.

> Los 3 productos iniciales son **solo paltas** (cajas de 5, 10 y 20 kg) con **precios ficticios** (proyecto de portfolio) y salen visibles. Si algún día se vende de verdad, se cambian los precios en `/admin/productos`.

### Variables de entorno

Copiá `.env.example` como `.env.local` (en tu PC) y cargá las mismas variables en Railway. **Nunca subas `.env.local` a GitHub ni pegues las claves en un chat.**

| Variable | Para qué | Obligatoria |
| --- | --- | --- |
| `DATABASE_URL` | Postgres. En Railway la da el servicio Postgres. En tu PC dejala vacía: usa una base embebida en `.data/` | En producción |
| `DATABASE_SSL` | `true` solo si tu Postgres exige SSL (URL pública) | No |
| `ADMIN_PASSWORD` | Contraseña del panel | Sí |
| `SESSION_SECRET` | Texto aleatorio de 16+ caracteres para firmar la sesión | Sí |
| `SITE_URL` | URL pública del sitio, sin barra final | Sí en producción |
| `MP_ACCESS_TOKEN` | Credencial de Mercado Pago. Sin ella solo se ofrece transferencia | No |
| `MP_WEBHOOK_SECRET` | Clave de firma de webhooks de Mercado Pago (recomendada) | No |

### Publicar en Railway

1. En Railway, creá un proyecto desde este repositorio de GitHub y agregá un servicio **PostgreSQL**.
2. En el servicio de la app, cargá las variables de arriba. Para `DATABASE_URL` usá una referencia al Postgres (`${{ Postgres.DATABASE_URL }}`).
3. `SITE_URL` = el dominio que te da Railway (por ejemplo `https://palta-landing-production.up.railway.app`).
4. Railway ejecuta `npm run build` y `npm run start`. Las tablas y los productos de ejemplo se crean solos en el primer uso.
5. Entrá a `https://TU-DOMINIO/admin`, cargá los productos reales y activalos.

### Configurar Mercado Pago

1. En [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app) creá una aplicación de **Checkout Pro**.
2. Copiá el **Access Token** a `MP_ACCESS_TOKEN`. Empezá con las credenciales de **prueba** y pasá a las de producción cuando todo funcione.
3. En **Webhooks**, agregá la URL `https://TU-DOMINIO/api/webhooks/mercadopago`, activá el evento **Pagos** y copiá la clave secreta a `MP_WEBHOOK_SECRET`.
4. Mercado Pago **no acepta `localhost`**: en tu PC el botón "Ir a pagar" funciona pero el comprador no vuelve solo al sitio, y el webhook solo llega a una URL pública (Railway, o un túnel como ngrok con `SITE_URL` apuntando a él).

### Desarrollo local

```bash
npm install
npm run dev
```

Con `.env.local` (`ADMIN_PASSWORD`, `SESSION_SECRET`, `SITE_URL=http://localhost:3000`) ya podés entrar a `http://localhost:3000/admin`. La base de prueba vive en `.data/` y se puede borrar para empezar de cero.

### Seguridad

- Los precios y kilos se toman siempre de la base de datos, nunca del navegador.
- Límite de 8 pedidos cada 10 minutos por IP y campo trampa contra bots.
- La página pública del pedido solo muestra el detalle, sin teléfono, email ni dirección.
- Un pago solo confirma el pedido si Mercado Pago lo reporta aprobado, con el `external_reference` del pedido y el monto exacto.
- Cada página y cada acción del panel verifica la sesión; la cookie es `httpOnly`, firmada y expira a los 7 días.
- El límite de pedidos y de intentos de login se guarda en memoria del servidor: alcanza para una sola instancia.

## Estado del proyecto

**Fase**: landing con scroll, tienda de pedidos y panel de administración implementados.

Verificado: tipos, lint y build de producción; flujo completo de pedido, confirmación de pago, entrega y cancelación en el navegador (escritorio y celular); lógica de Mercado Pago contra un servidor simulado; y el camino de producción con el driver `pg` contra un servidor con protocolo Postgres.

**Pendiente de verificar con cuentas reales:** el cobro con Mercado Pago real (credenciales de prueba) y la competencia simultánea por stock en un Postgres de verdad (usa `SELECT … FOR UPDATE`). Probalo con las credenciales de prueba antes de abrir al público.

## Contacto

Para consultas, pedidos o visitas al campo:
- 📧 Email: murrazzusabrina@gmail.com
- 💬 WhatsApp: +54 9 3795 039055
- 📍 Ubicación: Colón 1707, Paso de los Libres, Corrientes

---

Desarrollado con ❤️ para Los 108.
