import { NextResponse } from 'next/server';
import { isWebhookSignatureValid } from '@/lib/mercadopago';
import { syncMercadoPagoPayment } from '@/lib/payments';

/**
 * Mercado Pago avisa acá cuando cambia un pago. El aviso es solo un disparador: el pago se
 * vuelve a consultar a Mercado Pago y recién ahí se confirma el pedido.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id');

  if (!isWebhookSignatureValid({ signature: request.headers.get('x-signature'), requestId: request.headers.get('x-request-id'), dataId })) {
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 });
  }

  let body: { type?: string; topic?: string; data?: { id?: string | number } } = {};
  try {
    body = await request.json();
  } catch {
    // Algunas notificaciones antiguas (IPN) llegan sin cuerpo y con los datos en la URL
  }

  const type = body.type ?? body.topic ?? url.searchParams.get('type') ?? url.searchParams.get('topic');
  const paymentId = String(body.data?.id ?? dataId ?? '');

  // Otros tipos de aviso (merchant_order, etc.) se confirman con 200 y no hacen nada
  if (type !== 'payment' || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await syncMercadoPagoPayment(paymentId);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    // 500 hace que Mercado Pago reintente más tarde
    console.error('[webhook mercadopago]', error);
    return NextResponse.json({ error: 'No se pudo procesar el aviso.' }, { status: 500 });
  }
}
