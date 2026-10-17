/** El dinero se guarda en centavos enteros (nunca decimales) para que las sumas no fallen. */
const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const pesosConCentavos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatMoney(cents: number): string {
  return cents % 100 === 0 ? pesos.format(cents / 100) : pesosConCentavos.format(cents / 100);
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString('es-AR', { maximumFractionDigits: 2 })} kg`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

/** Redondea a 2 decimales (kilos). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** "25000" o "25.000,50" -> 2500000 centavos. Devuelve null si no es un número válido. */
export function pesosToCents(input: string): number | null {
  const clean = input.trim().replace(/\s/g, '');
  if (!clean) return null;
  // Formato es-AR: punto = miles, coma = decimales
  const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) ? cents : null;
}

export function centsToPesosInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2).replace('.', ',');
}
