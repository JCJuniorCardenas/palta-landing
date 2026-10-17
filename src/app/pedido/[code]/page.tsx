import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AutoRefresh } from '@/components/effects/AutoRefresh';
import { formatKg, formatMoney } from '@/lib/money';
import { getOrderByCode, type Order } from '@/lib/orders';
import { syncMercadoPagoPayment } from '@/lib/payments';
import { PICKUP_ADDRESS, whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Tu pedido | Los 108',
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ payment_id?: string; collection_id?: string; mp?: string }>;
};

function statusInfo(order: Order, checkoutUnavailable: boolean) {
  switch (order.status) {
    case 'paid':
      return { icon: '✓', title: 'Pago confirmado', tone: 'bg-[#e4f1e6] text-[#1f5a2b]', text: 'Recibimos tu pago. Te escribimos para coordinar la entrega.' };
    case 'delivered':
      return { icon: '✓', title: 'Pedido entregado', tone: 'bg-[#e4f1e6] text-[#1f5a2b]', text: '¡Gracias por elegir Los 108!' };
    case 'cancelled':
      return { icon: '✕', title: 'Pedido cancelado', tone: 'bg-[#f1e4e2] text-[#8a2d24]', text: 'Este pedido fue cancelado. Si fue un error, escribinos.' };
    default:
      if (order.paymentMethod === 'mercadopago' && !checkoutUnavailable) {
        return { icon: '…', title: 'Esperando la confirmación del pago', tone: 'bg-[#f7ecd5] text-[#7a5a12]', text: 'Si ya pagaste, esta página se actualiza sola en unos instantes.' };
      }
      return {
        icon: '…',
        title: 'Pedido recibido, falta el pago',
        tone: 'bg-[#f7ecd5] text-[#7a5a12]',
        text: checkoutUnavailable
          ? 'No pudimos abrir Mercado Pago, pero tu pedido quedó registrado. Escribinos y coordinamos el pago.'
          : 'Escribinos por WhatsApp con tu código y te pasamos los datos para la transferencia.',
      };
  }
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { code: rawCode } = await params;
  const { payment_id, collection_id, mp } = await searchParams;
  const code = rawCode.toUpperCase();

  let order = await getOrderByCode(code);
  if (!order) notFound();

  // Al volver de Mercado Pago llega el id del pago: se verifica con ellos antes de confirmar nada
  const paymentId = payment_id ?? collection_id;
  if (order.status === 'pending' && order.paymentMethod === 'mercadopago' && paymentId) {
    try {
      if ((await syncMercadoPagoPayment(paymentId)) === 'confirmed') {
        order = (await getOrderByCode(code)) ?? order;
      }
    } catch (error) {
      console.error('[pedido] no se pudo verificar el pago', error);
    }
  }

  const info = statusInfo(order, mp === 'unavailable');
  const waiting = order.status === 'pending' && order.paymentMethod === 'mercadopago' && mp !== 'unavailable';
  const needsContact = order.status === 'pending' && !waiting;

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-10 text-[#1F1F1C] sm:px-10">
      {waiting && <AutoRefresh seconds={8} />}

      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2F5D3A]">
          Los 108
        </Link>

        <div className="mt-8 rounded-3xl border border-[#d9ccbc] bg-white p-6 shadow-sm sm:p-8">
          <p className="eyebrow">Tu pedido</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-wide text-[#2F5D3A]">#{order.code}</h1>
          <p className="mt-1 text-sm text-[#6b6258]">Guardá este código: lo vas a necesitar para consultar tu pedido.</p>

          <div className={`mt-6 rounded-2xl p-4 ${info.tone}`}>
            <p className="flex items-center gap-2 font-bold">
              <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-sm">
                {info.icon}
              </span>
              {info.title}
            </p>
            <p className="mt-1 text-sm">{info.text}</p>
          </div>

          <ul className="mt-6 divide-y divide-[#EDE4D8]">
            {order.items.map((item) => (
              <li key={item.productName} className="flex justify-between gap-4 py-3 text-sm">
                <span>
                  {item.quantity} × {item.productName}
                  <span className="block text-xs text-[#6b6258]">{formatKg(item.unitKg * item.quantity)}</span>
                </span>
                <span className="font-semibold">{formatMoney(item.unitPriceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-end justify-between border-t-2 border-[#2F5D3A] pt-4">
            <span className="text-sm text-[#4F473E]">Total ({formatKg(order.totalKg)})</span>
            <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2F5D3A]">{formatMoney(order.totalCents)}</span>
          </div>

          <p className="mt-5 text-sm text-[#4F473E]">
            {order.deliveryMethod === 'retiro' ? (
              <>
                <strong>Retiro en el campo:</strong> {PICKUP_ADDRESS}. Coordinamos el día y la hora por WhatsApp.
              </>
            ) : (
              <>
                <strong>Envío:</strong> el costo y la fecha se coordinan por WhatsApp.
              </>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink(needsContact ? `Hola! Hice el pedido #${order.code} y quiero coordinar el pago.` : `Hola! Consulto por mi pedido #${order.code}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f8f4f] px-8 text-base font-bold text-white shadow-md transition-colors hover:bg-[#177840]"
            >
              Escribir por WhatsApp
            </a>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[#2F5D3A] px-8 text-base font-bold text-[#2F5D3A] transition-colors hover:bg-[#2F5D3A]/5">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
