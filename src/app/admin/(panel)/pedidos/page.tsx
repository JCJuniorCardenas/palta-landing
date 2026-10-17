import type { Metadata } from 'next';
import Link from 'next/link';
import { OrderCard } from '@/components/admin/OrderCard';
import { AutoRefresh } from '@/components/effects/AutoRefresh';
import { requireAdmin } from '@/lib/auth';
import { listOrders, type OrderStatus } from '@/lib/orders';

export const metadata: Metadata = { title: 'Pedidos | Panel Los 108' };

const FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes de pago' },
  { value: 'paid', label: 'Pagados' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await requireAdmin();

  const { estado } = await searchParams;
  const status = FILTERS.find((f) => f.value === estado)?.value ?? 'all';
  const orders = await listOrders({ status, limit: 100 });

  return (
    <div className="space-y-5">
      <AutoRefresh seconds={30} />

      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2F5D3A]">Pedidos</h1>
        <p className="text-sm text-[#6b6258]">Tocá un pedido para ver el detalle y los datos del cliente.</p>
      </div>

      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link key={filter.value} href={filter.value === 'all' ? '/admin/pedidos' : `/admin/pedidos?estado=${filter.value}`} aria-current={filter.value === status ? 'true' : undefined} className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${filter.value === status ? 'border-[#2F5D3A] bg-[#2F5D3A] text-white' : 'border-[#d9ccbc] bg-white text-[#4F473E] hover:bg-[#EDE4D8]'}`}>
            {filter.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-3">
        {orders.length === 0 ? <p className="rounded-2xl border border-[#E5DED3] bg-white p-6 text-sm text-[#6b6258]">No hay pedidos en esta lista.</p> : orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>
    </div>
  );
}
