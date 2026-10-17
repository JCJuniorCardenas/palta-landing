import { query } from '@/lib/db';

/** Día corrido en hora de Argentina, para que "hoy" no cambie a las 21 hs por el UTC del servidor. */
const TZ = 'America/Argentina/Buenos_Aires';

export type Range = '1' | '7' | '30' | 'all';

export const RANGE_LABELS: Record<Range, string> = {
  '1': 'Hoy',
  '7': '7 días',
  '30': '30 días',
  all: 'Todo',
};

export function parseRange(value: string | undefined): Range {
  return value === '1' || value === '7' || value === '30' || value === 'all' ? value : '30';
}

/** Solo cuentan ventas confirmadas: pagadas o entregadas, por fecha de PAGO. `range` ya viene validado. */
function paidFilter(range: Range): string {
  const base = `o.status IN ('paid', 'delivered')`;
  if (range === 'all') return base;
  const days = Number(range);
  return `${base} AND o.paid_at >= (((now() AT TIME ZONE '${TZ}')::date - ${days - 1})::timestamp AT TIME ZONE '${TZ}')`;
}

export type Kpis = {
  orders: number;
  revenueCents: number;
  kg: number;
  averageCents: number;
};

export async function getKpis(range: Range): Promise<Kpis> {
  const { rows } = await query<{ orders: number; cents: number; kg: number }>(
    `SELECT COUNT(*)::int AS orders, COALESCE(SUM(o.total_cents), 0)::float8 AS cents, COALESCE(SUM(o.total_kg), 0)::float8 AS kg
     FROM orders o WHERE ${paidFilter(range)}`,
  );
  const { orders, cents, kg } = rows[0];
  return { orders, revenueCents: cents, kg, averageCents: orders > 0 ? Math.round(cents / orders) : 0 };
}

export type OpenOrders = {
  pendingCount: number;
  pendingCents: number;
  toDeliverCount: number;
  toDeliverKg: number;
};

/** Lo que todavía no es venta confirmada o falta entregar. No depende del período. */
export async function getOpenOrders(): Promise<OpenOrders> {
  const { rows } = await query<{ pending_count: number; pending_cents: number; deliver_count: number; deliver_kg: number }>(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
       COALESCE(SUM(total_cents) FILTER (WHERE status = 'pending'), 0)::float8 AS pending_cents,
       COUNT(*) FILTER (WHERE status = 'paid')::int AS deliver_count,
       COALESCE(SUM(total_kg) FILTER (WHERE status = 'paid'), 0)::float8 AS deliver_kg
     FROM orders`,
  );
  const r = rows[0];
  return { pendingCount: r.pending_count, pendingCents: r.pending_cents, toDeliverCount: r.deliver_count, toDeliverKg: r.deliver_kg };
}

export type DayPoint = { day: string; revenueCents: number; kg: number; orders: number };

/** Una fila por día (incluye los días sin ventas), de más viejo a más nuevo. */
export async function getDailySeries(days: number): Promise<DayPoint[]> {
  const span = Math.min(Math.max(Math.trunc(days), 1), 90);
  const { rows } = await query<{ day: string; cents: number; kg: number; orders: number }>(
    `WITH days AS (
       SELECT ((now() AT TIME ZONE '${TZ}')::date - g) AS day FROM generate_series(0, $1::int - 1) AS g
     )
     SELECT to_char(days.day, 'YYYY-MM-DD') AS day,
            COALESCE(SUM(o.total_cents), 0)::float8 AS cents,
            COALESCE(SUM(o.total_kg), 0)::float8 AS kg,
            COUNT(o.id)::int AS orders
     FROM days
     LEFT JOIN orders o ON o.status IN ('paid', 'delivered') AND (o.paid_at AT TIME ZONE '${TZ}')::date = days.day
     GROUP BY days.day ORDER BY days.day`,
    [span],
  );
  return rows.map((r) => ({ day: r.day, revenueCents: r.cents, kg: r.kg, orders: r.orders }));
}

export type TopProduct = { name: string; units: number; kg: number; revenueCents: number };

export async function getTopProducts(range: Range): Promise<TopProduct[]> {
  const { rows } = await query<{ name: string; units: number; kg: number; cents: number }>(
    `SELECT oi.product_name AS name,
            SUM(oi.quantity)::int AS units,
            SUM(oi.quantity * oi.unit_kg)::float8 AS kg,
            SUM(oi.quantity * oi.unit_price_cents)::float8 AS cents
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE ${paidFilter(range)}
     GROUP BY oi.product_name ORDER BY cents DESC LIMIT 6`,
  );
  return rows.map((r) => ({ name: r.name, units: r.units, kg: r.kg, revenueCents: r.cents }));
}
