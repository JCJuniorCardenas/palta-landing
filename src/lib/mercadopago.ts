import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Order } from '@/lib/orders';

// MP_API_BASE solo existe para poder probar con un servidor falso; en producción no se define.
const apiBase = () => (process.env.MP_API_BASE ?? 'https://api.mercadopago.com').replace(/\/$/, '');

export const isMercadoPagoEnabled = () => Boolean(process.env.MP_ACCESS_TOKEN);

export function siteUrl(): string {
  return (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

/** Mercado Pago no acepta localhost en las URLs de retorno: solo se mandan si el sitio es público y https. */
function isPublicHttps(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
}

async function mpFetch(path: string, init: RequestInit & { idempotencyKey?: string } = {}) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('Mercado Pago no está configurado (falta MP_ACCESS_TOKEN).');

  const { idempotencyKey, ...rest } = init;
  const response = await fetch(`${apiBase()}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
    },
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago respondió ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  return response.json() as Promise<Record<string, unknown>>;
}

/** Crea la preferencia de Checkout Pro y devuelve la URL a la que hay que mandar al comprador. */
export async function createCheckout(order: Order): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const base = siteUrl();
  const returnUrl = `${base}/pedido/${order.code}`;

  const body: Record<string, unknown> = {
    items: order.items.map((item, index) => ({
      id: String(index + 1),
      title: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPriceCents / 100,
      currency_id: 'ARS',
    })),
    payer: { name: order.customerName, email: order.customerEmail },
    external_reference: order.id,
    statement_descriptor: 'LOS108',
  };

  if (isPublicHttps(base)) {
    body.back_urls = { success: returnUrl, pending: returnUrl, failure: returnUrl };
    body.auto_return = 'approved';
    body.notification_url = `${base}/api/webhooks/mercadopago`;
  }

  const result = await mpFetch('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify(body),
    idempotencyKey: order.id,
  });

  const preferenceId = String(result.id ?? '');
  const checkoutUrl = String(result.init_point ?? '');
  if (!preferenceId || !checkoutUrl) throw new Error('Mercado Pago no devolvió la URL de pago.');

  return { preferenceId, checkoutUrl };
}

export type MercadoPagoPayment = {
  id: string;
  status: string;
  externalReference: string | null;
  amountCents: number;
  currency: string;
};

/** Consulta el pago directamente a Mercado Pago. Es la fuente de verdad: nunca se confía en lo que llega por la URL o el webhook. */
export async function fetchPayment(paymentId: string): Promise<MercadoPagoPayment> {
  if (!/^\d{1,20}$/.test(paymentId)) throw new Error('Identificador de pago inválido.');

  const data = await mpFetch(`/v1/payments/${paymentId}`);
  return {
    id: String(data.id),
    status: String(data.status ?? ''),
    externalReference: typeof data.external_reference === 'string' ? data.external_reference : null,
    amountCents: Math.round(Number(data.transaction_amount ?? 0) * 100),
    currency: String(data.currency_id ?? ''),
  };
}

function safeEqualHex(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'hex');
  const bufferB = Buffer.from(b, 'hex');
  return bufferA.length > 0 && bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

/**
 * Valida la firma `x-signature` del webhook (HMAC-SHA256 de "id:<data.id>;request-id:<x-request-id>;ts:<ts>;").
 * Si no hay MP_WEBHOOK_SECRET se acepta igual, porque el pago se vuelve a consultar a Mercado Pago antes de confirmarlo.
 */
export function isWebhookSignatureValid(params: { signature: string | null; requestId: string | null; dataId: string | null }): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!params.signature) return false;

  const parts = Object.fromEntries(
    params.signature.split(',').map((part) => {
      const [key, ...value] = part.trim().split('=');
      return [key, value.join('=')];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Se arma el manifiesto con las partes que llegaron; si data.id es alfanumérico se prueba también en minúsculas
  const candidates = new Set([params.dataId, params.dataId?.toLowerCase()]);
  for (const id of candidates) {
    const manifest = [id ? `id:${id};` : '', params.requestId ? `request-id:${params.requestId};` : '', `ts:${ts};`].join('');
    const expected = createHmac('sha256', secret).update(manifest).digest('hex');
    if (safeEqualHex(expected, v1)) return true;
  }
  return false;
}
