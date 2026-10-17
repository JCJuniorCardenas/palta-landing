/**
 * Límite simple en memoria (por proceso). Alcanza para frenar abuso básico de
 * formularios; no reemplaza a un WAF si el sitio crece.
 */
const buckets = new Map<string, number[]>();

/** Devuelve true si la acción está permitida, y la registra. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  if (buckets.size > 5000) {
    for (const [k, times] of buckets) {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

/** Cuenta un intento sin consultar el límite (para contar solo los fallidos). */
export function isBlocked(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  return (buckets.get(key) ?? []).filter((t) => now - t < windowMs).length >= limit;
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'desconocida';
}
