export type PaymentMethod = 'mercadopago' | 'transferencia';
export type DeliveryMethod = 'retiro' | 'envio';

export type OrderInput = {
  items: { productId: number; quantity: number }[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCuit: string | null;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod;
};

export type FieldErrors = Record<string, string>;

type Result<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[0-9+()\-\s]{6,30}$/;
const CUIT = /^[0-9\-]{8,13}$/;

const MAX_ITEMS = 20;
const MAX_QUANTITY = 999;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Valida el cuerpo del pedido que manda el formulario público. Nunca confía en precios del cliente. */
export function parseOrderInput(body: unknown): Result<OrderInput> {
  const errors: FieldErrors = {};
  const data = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items: OrderInput['items'] = [];
  const seen = new Set<number>();

  for (const raw of rawItems.slice(0, MAX_ITEMS)) {
    const entry = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const productId = Number(entry.productId);
    const quantity = Number(entry.quantity);

    if (!Number.isInteger(productId) || productId <= 0 || seen.has(productId)) continue;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
      errors.items = `La cantidad máxima por producto es ${MAX_QUANTITY}.`;
      continue;
    }
    if (quantity === 0) continue;

    seen.add(productId);
    items.push({ productId, quantity });
  }
  if (items.length === 0 && !errors.items) errors.items = 'Elegí al menos un producto.';

  const customerName = text(data.customerName);
  if (customerName.length < 2 || customerName.length > 80) errors.customerName = 'Ingresá tu nombre.';

  const customerPhone = text(data.customerPhone);
  if (!PHONE.test(customerPhone)) errors.customerPhone = 'Ingresá un teléfono válido.';

  const customerEmail = text(data.customerEmail).toLowerCase();
  if (!EMAIL.test(customerEmail) || customerEmail.length > 120) errors.customerEmail = 'Ingresá un email válido.';

  const cuitRaw = text(data.customerCuit);
  if (cuitRaw && !CUIT.test(cuitRaw)) errors.customerCuit = 'El CUIT debe tener solo números y guiones.';

  const deliveryMethod = data.deliveryMethod === 'envio' ? 'envio' : data.deliveryMethod === 'retiro' ? 'retiro' : null;
  if (!deliveryMethod) errors.deliveryMethod = 'Elegí cómo recibir tu pedido.';

  const addressRaw = text(data.deliveryAddress);
  if (deliveryMethod === 'envio' && (addressRaw.length < 5 || addressRaw.length > 200)) {
    errors.deliveryAddress = 'Ingresá la dirección de entrega.';
  }

  const notes = text(data.notes);
  if (notes.length > 500) errors.notes = 'Las notas pueden tener hasta 500 caracteres.';

  const paymentMethod = data.paymentMethod === 'mercadopago' ? 'mercadopago' : data.paymentMethod === 'transferencia' ? 'transferencia' : null;
  if (!paymentMethod) errors.paymentMethod = 'Elegí un medio de pago.';

  if (Object.keys(errors).length > 0 || !deliveryMethod || !paymentMethod) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      items,
      customerName,
      customerPhone,
      customerEmail,
      customerCuit: cuitRaw || null,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'envio' ? addressRaw : null,
      notes: notes || null,
      paymentMethod,
    },
  };
}
