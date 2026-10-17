import { randomInt } from 'node:crypto';
import { getDb, query, transaction, type Queryable } from '@/lib/db';
import { round2 } from '@/lib/money';
import type { DeliveryMethod, OrderInput, PaymentMethod } from '@/lib/validation';

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled';
export type OrderAction = 'confirm_payment' | 'deliver' | 'cancel';

/** Estados que cuentan como venta confirmada en el dashboard. */
export const PAID_STATUSES = ['paid', 'delivered'] as const;

/** Error pensado para mostrarse al cliente tal cual. */
export class OrderError extends Error {}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID.test(value);

// ---------------------------------------------------------------- productos

export type Product = {
  id: number;
  name: string;
  description: string;
  unitKg: number;
  priceCents: number;
  stockUnits: number | null;
  active: boolean;
  sortOrder: number;
};

type ProductRow = {
  id: number;
  name: string;
  description: string;
  unit_kg: number;
  price_cents: number;
  stock_units: number | null;
  active: boolean;
  sort_order: number;
};

const PRODUCT_COLS = 'id, name, description, unit_kg::float8 AS unit_kg, price_cents, stock_units, active, sort_order';

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  description: r.description,
  unitKg: r.unit_kg,
  priceCents: r.price_cents,
  stockUnits: r.stock_units,
  active: r.active,
  sortOrder: r.sort_order,
});

export async function listProducts(options: { onlyActive?: boolean } = {}): Promise<Product[]> {
  const where = options.onlyActive ? 'WHERE active' : '';
  const { rows } = await query<ProductRow>(`SELECT ${PRODUCT_COLS} FROM products ${where} ORDER BY sort_order, id`);
  return rows.map(toProduct);
}

export type ProductInput = {
  name: string;
  description: string;
  unitKg: number;
  priceCents: number;
  stockUnits: number | null;
  active: boolean;
};

export async function createProduct(input: ProductInput): Promise<void> {
  await query(
    `INSERT INTO products (name, description, unit_kg, price_cents, stock_units, active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE((SELECT MAX(sort_order) FROM products), 0) + 1)`,
    [input.name, input.description, input.unitKg, input.priceCents, input.stockUnits, input.active],
  );
}

export async function updateProduct(id: number, input: ProductInput): Promise<boolean> {
  const res = await query(
    'UPDATE products SET name = $2, description = $3, unit_kg = $4, price_cents = $5, stock_units = $6, active = $7 WHERE id = $1',
    [id, input.name, input.description, input.unitKg, input.priceCents, input.stockUnits, input.active],
  );
  return res.rowCount > 0;
}

// ------------------------------------------------------------------ pedidos

export type OrderItem = {
  productName: string;
  unitKg: number;
  unitPriceCents: number;
  quantity: number;
};

export type Order = {
  id: string;
  code: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCuit: string | null;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string | null;
  notes: string | null;
  totalCents: number;
  totalKg: number;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  createdAt: Date;
  paidAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  items: OrderItem[];
};

type OrderRow = {
  id: string;
  code: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_cuit: string | null;
  delivery_method: DeliveryMethod;
  delivery_address: string | null;
  notes: string | null;
  total_cents: number;
  total_kg: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  created_at: string | Date;
  paid_at: string | Date | null;
  delivered_at: string | Date | null;
  cancelled_at: string | Date | null;
};

type ItemRow = {
  order_id: string;
  product_name: string;
  unit_kg: number;
  unit_price_cents: number;
  quantity: number;
};

const ORDER_COLS = `id, code, status, payment_method, customer_name, customer_phone, customer_email, customer_cuit,
  delivery_method, delivery_address, notes, total_cents, total_kg::float8 AS total_kg, mp_preference_id, mp_payment_id,
  created_at, paid_at, delivered_at, cancelled_at`;

const date = (value: string | Date | null) => (value ? new Date(value) : null);

async function withItems(db: Queryable, rows: OrderRow[]): Promise<Order[]> {
  if (rows.length === 0) return [];

  const marks = rows.map((_, i) => `$${i + 1}`).join(', ');
  const { rows: itemRows } = await db.query<ItemRow>(
    `SELECT order_id, product_name, unit_kg::float8 AS unit_kg, unit_price_cents, quantity
     FROM order_items WHERE order_id IN (${marks}) ORDER BY id`,
    rows.map((r) => r.id),
  );

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    status: r.status,
    paymentMethod: r.payment_method,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    customerCuit: r.customer_cuit,
    deliveryMethod: r.delivery_method,
    deliveryAddress: r.delivery_address,
    notes: r.notes,
    totalCents: r.total_cents,
    totalKg: r.total_kg,
    mpPreferenceId: r.mp_preference_id,
    mpPaymentId: r.mp_payment_id,
    createdAt: new Date(r.created_at),
    paidAt: date(r.paid_at),
    deliveredAt: date(r.delivered_at),
    cancelledAt: date(r.cancelled_at),
    items: itemRows
      .filter((i) => i.order_id === r.id)
      .map((i) => ({ productName: i.product_name, unitKg: i.unit_kg, unitPriceCents: i.unit_price_cents, quantity: i.quantity })),
  }));
}

async function loadOrder(db: Queryable, column: 'id' | 'code', value: string): Promise<Order | null> {
  const { rows } = await db.query<OrderRow>(`SELECT ${ORDER_COLS} FROM orders WHERE ${column} = $1`, [value]);
  return (await withItems(db, rows))[0] ?? null;
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  if (!/^[A-Z0-9]{8}$/.test(code)) return null;
  return loadOrder(await getDb(), 'code', code);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!isUuid(id)) return null;
  return loadOrder(await getDb(), 'id', id);
}

export async function listOrders(options: { status?: OrderStatus | 'all'; limit?: number } = {}): Promise<Order[]> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const filter = options.status && options.status !== 'all';
  const { rows } = await query<OrderRow>(
    `SELECT ${ORDER_COLS} FROM orders ${filter ? 'WHERE status = $2' : ''} ORDER BY created_at DESC LIMIT $1`,
    filter ? [limit, options.status] : [limit],
  );
  return withItems(await getDb(), rows);
}

// Sin 0/O ni 1/I para que el código se pueda dictar por teléfono
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

// Entra en un int4 de Postgres con margen
const MAX_TOTAL_CENTS = 2_000_000_000;

/**
 * Crea el pedido. Los precios y kilos SIEMPRE se toman de la base, nunca del cliente.
 * Si el producto controla stock, lo descuenta en la misma transacción.
 */
export async function createOrder(input: OrderInput): Promise<Order> {
  return transaction(async (tx) => {
    const ids = input.items.map((i) => i.productId);
    const marks = ids.map((_, i) => `$${i + 1}`).join(', ');
    const { rows: products } = await tx.query<ProductRow>(
      `SELECT ${PRODUCT_COLS} FROM products WHERE active AND id IN (${marks}) FOR UPDATE`,
      ids,
    );
    const byId = new Map(products.map((p) => [p.id, p]));

    const lines = input.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        throw new OrderError('Uno de los productos ya no está disponible. Actualizá la página e intentá de nuevo.');
      }
      if (product.stock_units !== null && product.stock_units < item.quantity) {
        throw new OrderError(`No hay stock suficiente de "${product.name}" (quedan ${product.stock_units}).`);
      }
      return { product, quantity: item.quantity };
    });

    const totalCents = lines.reduce((sum, l) => sum + l.product.price_cents * l.quantity, 0);
    const totalKg = round2(lines.reduce((sum, l) => sum + l.product.unit_kg * l.quantity, 0));

    if (totalCents <= 0 || totalCents > MAX_TOTAL_CENTS) {
      throw new OrderError('El total del pedido no es válido. Revisá las cantidades.');
    }

    let orderId: string | null = null;
    for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
      const { rows } = await tx.query<{ id: string }>(
        `INSERT INTO orders (code, payment_method, customer_name, customer_phone, customer_email, customer_cuit,
           delivery_method, delivery_address, notes, total_cents, total_kg)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (code) DO NOTHING RETURNING id`,
        [
          generateCode(),
          input.paymentMethod,
          input.customerName,
          input.customerPhone,
          input.customerEmail,
          input.customerCuit,
          input.deliveryMethod,
          input.deliveryAddress,
          input.notes,
          totalCents,
          totalKg,
        ],
      );
      orderId = rows[0]?.id ?? null;
    }
    if (!orderId) throw new Error('No se pudo generar el código del pedido.');

    for (const { product, quantity } of lines) {
      await tx.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_kg, unit_price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, product.id, product.name, product.unit_kg, product.price_cents, quantity],
      );
      if (product.stock_units !== null) {
        await tx.query('UPDATE products SET stock_units = stock_units - $2 WHERE id = $1', [product.id, quantity]);
      }
    }

    const order = await loadOrder(tx, 'id', orderId);
    if (!order) throw new Error('No se pudo leer el pedido recién creado.');
    return order;
  });
}

/** Acciones del dueño sobre un pedido. Devuelve false si el pedido no estaba en un estado válido para la acción. */
export async function applyOrderAction(orderId: string, action: OrderAction): Promise<boolean> {
  if (!isUuid(orderId)) return false;

  if (action === 'confirm_payment') {
    const res = await query(`UPDATE orders SET status = 'paid', paid_at = now() WHERE id = $1 AND status = 'pending'`, [orderId]);
    return res.rowCount > 0;
  }

  if (action === 'deliver') {
    const res = await query(`UPDATE orders SET status = 'delivered', delivered_at = now() WHERE id = $1 AND status = 'paid'`, [orderId]);
    return res.rowCount > 0;
  }

  // cancel: devuelve el stock reservado
  return transaction(async (tx) => {
    const res = await tx.query(
      `UPDATE orders SET status = 'cancelled', cancelled_at = now() WHERE id = $1 AND status IN ('pending', 'paid')`,
      [orderId],
    );
    if (res.rowCount === 0) return false;

    await tx.query(
      `UPDATE products p SET stock_units = p.stock_units + oi.quantity
       FROM order_items oi WHERE oi.order_id = $1 AND p.id = oi.product_id AND p.stock_units IS NOT NULL`,
      [orderId],
    );
    return true;
  });
}

/** Marca como pagado un pedido pendiente (idempotente: si ya estaba pagado no hace nada). */
export async function markPaidFromMercadoPago(orderId: string, paymentId: string): Promise<boolean> {
  const res = await query(
    `UPDATE orders SET status = 'paid', paid_at = now(), mp_payment_id = $2 WHERE id = $1 AND status = 'pending'`,
    [orderId, paymentId],
  );
  return res.rowCount > 0;
}

export async function setMercadoPagoPreference(orderId: string, preferenceId: string): Promise<void> {
  await query('UPDATE orders SET mp_preference_id = $2 WHERE id = $1', [orderId, preferenceId]);
}
