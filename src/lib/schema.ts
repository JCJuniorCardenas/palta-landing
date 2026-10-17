/** Esquema de la base. Todo es IF NOT EXISTS: se aplica solo al primer uso. */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  unit_kg numeric(8,2) NOT NULL CHECK (unit_kg > 0),
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  stock_units integer CHECK (stock_units IS NULL OR stock_units >= 0),
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','delivered','cancelled')),
  payment_method text NOT NULL CHECK (payment_method IN ('mercadopago','transferencia')),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  customer_cuit text,
  delivery_method text NOT NULL CHECK (delivery_method IN ('retiro','envio')),
  delivery_address text,
  notes text,
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  total_kg numeric(10,2) NOT NULL CHECK (total_kg >= 0),
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz
);

CREATE TABLE IF NOT EXISTS order_items (
  id serial PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_kg numeric(8,2) NOT NULL,
  unit_price_cents integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_paid_idx ON orders (paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
`;

/**
 * Productos iniciales: solo paltas, con precios FICTICIOS (proyecto de portfolio).
 * Se cargan solo si la tabla está vacía y se editan desde /admin/productos.
 * Si algún día se vende de verdad, se cambian los precios ahí mismo.
 */
export const SEED_PRODUCTS = [
  { name: 'Paltas - caja 5 kg', description: 'Paltas orgánicas de Los 108, caja de 5 kg.', unitKg: 5, priceCents: 2500000, sortOrder: 1 },
  { name: 'Paltas - caja 10 kg', description: 'Paltas orgánicas de Los 108, caja de 10 kg.', unitKg: 10, priceCents: 4500000, sortOrder: 2 },
  { name: 'Paltas - caja 20 kg (mayorista)', description: 'Para negocios y restaurantes. Caja de 20 kg.', unitKg: 20, priceCents: 8000000, sortOrder: 3 },
];
