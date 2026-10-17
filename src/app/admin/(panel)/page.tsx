import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart } from '@/components/admin/BarChart';
import { OrderCard } from '@/components/admin/OrderCard';
import { AutoRefresh } from '@/components/effects/AutoRefresh';
import { requireAdmin } from '@/lib/auth';
import { formatKg, formatMoney } from '@/lib/money';
import { listOrders } from '@/lib/orders';
import { RANGE_LABELS, getDailySeries, getKpis, getOpenOrders, getTopProducts, parseRange, type Range } from '@/lib/stats';

export const metadata: Metadata = { title: 'Resumen | Panel Los 108' };

const RANGES: Range[] = ['1', '7', '30', 'all'];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  await requireAdmin();

  const range = parseRange((await searchParams).r);
  const chartDays = range === '30' || range === 'all' ? 30 : 7;

  const [kpis, open, series, top, recent] = await Promise.all([
    getKpis(range),
    getOpenOrders(),
    getDailySeries(chartDays),
    getTopProducts(range),
    listOrders({ limit: 6 }),
  ]);

  const tile = 'rounded-2xl border border-[#E5DED3] bg-white p-5';
  const label = 'text-sm font-semibold text-[#6b6258]';

  return (
    <div className="space-y-6">
      <AutoRefresh seconds={30} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2F5D3A]">Resumen de ventas</h1>
          <p className="text-sm text-[#6b6258]">Solo cuentan los pedidos con pago confirmado. Se actualiza solo cada 30 segundos.</p>
        </div>
        <nav aria-label="Período" className="flex rounded-full border border-[#d9ccbc] bg-white p-1">
          {RANGES.map((value) => (
            <Link key={value} href={value === '30' ? '/admin' : `/admin?r=${value}`} aria-current={value === range ? 'true' : undefined} className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${value === range ? 'bg-[#2F5D3A] text-white' : 'text-[#4F473E] hover:bg-[#EDE4D8]'}`}>
              {RANGE_LABELS[value]}
            </Link>
          ))}
        </nav>
      </div>

      <section aria-label="Ventas confirmadas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`${tile} sm:col-span-2`}>
          <p className={label}>Ingresos · {RANGE_LABELS[range]}</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-5xl font-bold text-[#2F5D3A] sm:text-6xl">{formatMoney(kpis.revenueCents)}</p>
          <p className="mt-1 text-sm text-[#6b6258]">{kpis.orders > 0 ? `Ticket promedio ${formatMoney(kpis.averageCents)}` : 'Sin ventas confirmadas en este período'}</p>
        </div>
        <div className={tile}>
          <p className={label}>Pedidos pagados</p>
          <p className="mt-1 text-4xl font-bold">{kpis.orders}</p>
        </div>
        <div className={tile}>
          <p className={label}>Kilos vendidos</p>
          <p className="mt-1 text-4xl font-bold">{formatKg(kpis.kg)}</p>
        </div>
      </section>

      <section aria-label="Pedidos en curso" className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/pedidos?estado=pending" className={`${tile} transition-colors hover:border-[#A66A43]`}>
          <p className={label}>⏳ Pendientes de pago</p>
          <p className="mt-1 text-3xl font-bold">{open.pendingCount}</p>
          <p className="text-sm text-[#6b6258]">{formatMoney(open.pendingCents)} por cobrar · todavía no cuentan como venta</p>
        </Link>
        <Link href="/admin/pedidos?estado=paid" className={`${tile} transition-colors hover:border-[#A66A43]`}>
          <p className={label}>📦 Pagados, por entregar</p>
          <p className="mt-1 text-3xl font-bold">{open.toDeliverCount}</p>
          <p className="text-sm text-[#6b6258]">{formatKg(open.toDeliverKg)} para preparar</p>
        </Link>
      </section>

      <section aria-label="Gráficos" className="grid gap-4 lg:grid-cols-2">
        <BarChart title="Ingresos por día" subtitle={`Últimos ${chartDays} días`} points={series} metric="revenue" color="#2F5D3A" />
        <BarChart title="Kilos por día" subtitle={`Últimos ${chartDays} días`} points={series} metric="kg" color="#A66A43" />
      </section>

      <section aria-label="Productos más vendidos" className="rounded-2xl border border-[#E5DED3] bg-white p-5">
        <h2 className="font-bold">Productos más vendidos · {RANGE_LABELS[range]}</h2>
        {top.length === 0 ? (
          <p className="mt-3 text-sm text-[#6b6258]">Todavía no hay ventas confirmadas en este período.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-xs text-[#6b6258]">
                <tr>
                  <th className="py-2 font-semibold">Producto</th>
                  <th className="py-2 text-right font-semibold">Unidades</th>
                  <th className="py-2 text-right font-semibold">Kilos</th>
                  <th className="py-2 text-right font-semibold">Ingresos</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {top.map((product) => (
                  <tr key={product.name} className="border-t border-[#EDE4D8]">
                    <td className="py-2 font-semibold">{product.name}</td>
                    <td className="py-2 text-right">{product.units}</td>
                    <td className="py-2 text-right">{formatKg(product.kg)}</td>
                    <td className="py-2 text-right">{formatMoney(product.revenueCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-label="Últimos pedidos" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm font-bold text-[#2F5D3A] underline-offset-2 hover:underline">
            Ver todos
          </Link>
        </div>
        {recent.length === 0 ? <p className="rounded-2xl border border-[#E5DED3] bg-white p-5 text-sm text-[#6b6258]">Todavía no hay pedidos.</p> : recent.map((order) => <OrderCard key={order.id} order={order} />)}
      </section>
    </div>
  );
}
