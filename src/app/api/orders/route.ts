import { NextResponse } from 'next/server';
import { createCheckout, isMercadoPagoEnabled } from '@/lib/mercadopago';
import { OrderError, createOrder, setMercadoPagoPreference } from '@/lib/orders';
import { allow, clientIp } from '@/lib/rate-limit';
import { parseOrderInput } from '@/lib/validation';

const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  // Freno básico contra abuso: 8 pedidos cada 10 minutos por IP
  if (!allow(`order:${clientIp(request.headers)}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Hiciste muchos intentos seguidos. Probá de nuevo en unos minutos.' }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Pedido demasiado grande.' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  // Campo trampa: los bots lo completan, las personas no lo ven. Se responde "ok" sin crear nada.
  if (body && typeof body === 'object' && 'website' in body && (body as { website?: unknown }).website) {
    return NextResponse.json({ code: 'XXXXXXXX' });
  }

  const parsed = parseOrderInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Revisá los datos del pedido.', fields: parsed.errors }, { status: 422 });
  }

  if (parsed.value.paymentMethod === 'mercadopago' && !isMercadoPagoEnabled()) {
    return NextResponse.json({ error: 'El pago con Mercado Pago no está disponible por ahora.', fields: { paymentMethod: 'Elegí otro medio de pago.' } }, { status: 422 });
  }

  try {
    const order = await createOrder(parsed.value);

    if (order.paymentMethod === 'mercadopago') {
      try {
        const checkout = await createCheckout(order);
        await setMercadoPagoPreference(order.id, checkout.preferenceId);
        return NextResponse.json({ code: order.code, checkoutUrl: checkout.checkoutUrl }, { status: 201 });
      } catch (error) {
        // El pedido ya existe: queda pendiente y el cliente puede coordinar el pago con el dueño
        console.error('[api/orders] Mercado Pago falló', error);
        return NextResponse.json({ code: order.code, checkoutUnavailable: true }, { status: 201 });
      }
    }

    return NextResponse.json({ code: order.code }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('[api/orders]', error);
    return NextResponse.json({ error: 'No pudimos registrar tu pedido. Probá de nuevo en un momento.' }, { status: 500 });
  }
}
