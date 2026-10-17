/** Datos del negocio usados en varias páginas. */
export const WHATSAPP_NUMBER = '5493795039055';
export const PICKUP_ADDRESS = 'Colón 1707, Paso de los Libres, Corrientes';

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
