export type Scene = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Ruta en /public (ej. '/img/story/cosecha.jpg') o URL de Unsplash */
  image: string;
  alt: string;
  /** object-position de la foto, ej. '65% 40%'. Sirve para encuadrar */
  focus?: string;
};

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=80`;

/**
 * Escenas de "Del árbol a tu mesa".
 *
 * IMPORTANTE: solo la escena 1 y la 3 usan fotos propias del campo (palta1.jpg).
 * Las demás son fotos de stock PROVISORIAS. Para reemplazarlas: dejá tu foto en
 * public/img/story/ y cambiá `image` por '/img/story/tu-foto.jpg'.
 * Funciona mejor con fotos horizontales de al menos 1600 px de ancho.
 */
export const storyScenes: Scene[] = [
  {
    id: 'origen',
    eyebrow: 'Origen',
    title: 'De dónde viene nuestra palta.',
    body: 'En Los 108 cultivamos paltas en Paso de los Libres, Corrientes, combinando suelo, clima y manejo responsable para lograr fruta de sabor auténtico. Cada lote se trabaja con seguimiento constante para mantener calidad desde el origen.',
    image: '/img/palta1.jpg',
    alt: 'Paltas colgando del árbol en el campo',
    focus: '70% 50%',
  },
  {
    id: 'seleccion',
    eyebrow: 'Selección del lote',
    title: 'Cada lote tiene su momento.',
    body: 'Definimos el momento de cosecha por madurez y uniformidad.',
    image: unsplash('1601039641847-7857b994d704'), // PROVISORIA
    alt: 'Paltas Hass maduras, una cortada al medio',
    focus: '50% 45%',
  },
  {
    id: 'cosecha',
    eyebrow: 'Cosecha manual',
    title: 'Fruta por fruta, con cuidado.',
    body: 'Recolectamos con cuidado para proteger la fruta y la planta.',
    image: '/img/palta1.jpg',
    alt: 'Paltas y hojas del palto, listas para cosechar',
    focus: '18% 30%',
  },
  {
    id: 'acondicionamiento',
    eyebrow: 'Acondicionamiento',
    title: 'Clasificada y lista para viajar.',
    body: 'Clasificamos y preparamos cada partida para su despacho.',
    image: unsplash('1519162808019-7de1683fa2ad'), // PROVISORIA
    alt: 'Dos mitades de palta sobre fondo claro',
    focus: '50% 50%',
  },
  {
    id: 'mesa',
    eyebrow: 'A tu mesa',
    title: 'Sabor auténtico, directo a tu mesa.',
    body: 'La palta de Los 108 es 100% natural, directo de la planta a tu mesa. Contanos qué volumen necesitás y coordinamos la entrega.',
    image: unsplash('1523049673857-eb18f1d7b578'), // PROVISORIA
    alt: 'Mitad de palta con carozo sobre fondo rosa',
    focus: '50% 50%',
  },
];
