import { runOrderAction } from '@/app/admin/actions';
import { formatDateTime } from '@/lib/dates';
import { formatKg, formatMoney } from '@/lib/money';
import type { Order, OrderStatus } from '@/lib/orders';

const STATUS: Record<OrderStatus, { icon: string; label: string; tone: string }> = {
  pending: { icon: '…', label: 'Pendiente de pago', tone: 'bg-[#f7ecd5] text-[#7a5a12]' },
  paid: { icon: '✓', label: 'Pagado', tone: 'bg-[#e4f1e6] text-[#1f5a2b]' },
  delivered: { icon: '✓✓', label: 'Entregado', tone: 'bg-[#2F5D3A] text-white' },
  cancelled: { icon: '✕', label: 'Cancelado', tone: 'bg-[#ece8e1] text-[#6b6258]' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const info = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${info.tone}`}>
      <span aria-hidden="true">{info.icon}</span>
      {info.label}
    </span>
  );
}

const PAYMENT_LABEL = { mercadopago: 'Mercado Pago', transferencia: 'Transferencia' } as const;

const buttonBase = 'inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-bold transition-colors';

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E5DED3] bg-white">
      <details className="group">
        <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 p-4 marker:hidden sm:grid-cols-[7rem_1fr_auto_auto]">
          <span className="font-bold tracking-wide text-[#2F5D3A]">#{order.code}</span>
          <span className="order-last col-span-2 min-w-0 truncate text-sm text-[#4F473E] sm:order-none sm:col-span-1">
            {order.customerName} · {formatDateTime(order.createdAt)}
          </span>
          <span className="text-right font-bold tabular-nums">
            {formatMoney(order.totalCents)}
            <span className="block text-xs font-normal text-[#6b6258]">{formatKg(order.totalKg)}</span>
          </span>
          <span className="hidden sm:block">
            <StatusBadge status={order.status} />
          </span>
        </summary>

        <div className="space-y-4 border-t border-[#EDE4D8] bg-[#FAF9F6] p-4 text-sm">
          <div className="sm:hidden">
            <StatusBadge status={order.status} />
          </div>

          <ul className="divide-y divide-[#EDE4D8]">
            {order.items.map((item) => (
              <li key={item.productName} className="flex justify-between gap-4 py-2">
                <span>
                  {item.quantity} × {item.productName} <span className="text-[#6b6258]">({formatKg(item.unitKg * item.quantity)})</span>
                </span>
                <span className="font-semibold tabular-nums">{formatMoney(item.unitPriceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-[#898781]">Contacto</dt>
              <dd>
                {order.customerName}
                <br />
                <a href={`tel:${order.customerPhone}`} className="text-[#2F5D3A] underline">
                  {order.customerPhone}
                </a>
                <br />
                <a href={`mailto:${order.customerEmail}`} className="break-all text-[#2F5D3A] underline">
                  {order.customerEmail}
                </a>
                {order.customerCuit && (
                  <>
                    <br />
                    CUIT {order.customerCuit}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-[#898781]">Entrega y pago</dt>
              <dd>
                {order.deliveryMethod === 'retiro' ? 'Retiro en el campo' : `Envío a: ${order.deliveryAddress}`}
                <br />
                Pago: {PAYMENT_LABEL[order.paymentMethod]}
                {order.mpPaymentId && <span className="text-[#6b6258]"> (operación {order.mpPaymentId})</span>}
                {order.paidAt && (
                  <>
                    <br />
                    Pagado el {formatDateTime(order.paidAt)}
                  </>
                )}
                {order.deliveredAt && (
                  <>
                    <br />
                    Entregado el {formatDateTime(order.deliveredAt)}
                  </>
                )}
              </dd>
            </div>
            {order.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#898781]">Notas del cliente</dt>
                <dd>{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </details>

      {(order.status === 'pending' || order.status === 'paid') && (
        <div className="flex flex-wrap gap-2 border-t border-[#EDE4D8] px-4 py-3">
          {order.status === 'pending' && (
            <form action={runOrderAction.bind(null, order.id, 'confirm_payment')}>
              <button type="submit" className={`${buttonBase} bg-[#2F5D3A] text-white hover:bg-[#244B2E]`}>
                Confirmar pago
              </button>
            </form>
          )}
          {order.status === 'paid' && (
            <form action={runOrderAction.bind(null, order.id, 'deliver')}>
              <button type="submit" className={`${buttonBase} bg-[#A66A43] text-white hover:bg-[#8C5734]`}>
                Marcar entregado
              </button>
            </form>
          )}
          <form action={runOrderAction.bind(null, order.id, 'cancel')}>
            <button type="submit" className={`${buttonBase} border border-[#d9ccbc] text-[#8a2d24] hover:bg-[#fdecea]`}>
              Cancelar pedido
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
