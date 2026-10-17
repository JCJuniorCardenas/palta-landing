import { fetchPayment, isMercadoPagoEnabled } from '@/lib/mercadopago';
import { getOrderById, markPaidFromMercadoPago } from '@/lib/orders';

export type SyncResult = 'confirmed' | 'already_paid' | 'not_approved' | 'mismatch' | 'unknown_order' | 'disabled';

/**
 * Confirma un pedido a partir de un pago de Mercado Pago. Se usa desde el webhook y desde la
 * página de retorno. Solo marca como pagado si Mercado Pago confirma que el pago está aprobado,
 * es del pedido correcto y por el monto exacto.
 */
export async function syncMercadoPagoPayment(paymentId: string): Promise<SyncResult> {
  if (!isMercadoPagoEnabled()) return 'disabled';

  const payment = await fetchPayment(paymentId);
  if (!payment.externalReference) return 'unknown_order';

  const order = await getOrderById(payment.externalReference);
  if (!order) return 'unknown_order';

  if (payment.status !== 'approved') return 'not_approved';
  if (payment.currency !== 'ARS' || payment.amountCents !== order.totalCents) return 'mismatch';

  const changed = await markPaidFromMercadoPago(order.id, payment.id);
  return changed ? 'confirmed' : 'already_paid';
}
