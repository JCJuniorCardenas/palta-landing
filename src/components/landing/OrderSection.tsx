'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { formatKg, formatMoney, round2 } from '@/lib/money';

type CatalogProduct = {
  id: number;
  name: string;
  description: string;
  unitKg: number;
  priceCents: number;
  soldOut: boolean;
  maxQuantity: number;
};

type Catalog = { products: CatalogProduct[]; mercadoPago: boolean };
type DeliveryMethod = 'retiro' | 'envio';
type PaymentMethod = 'mercadopago' | 'transferencia';

const emptyForm = { customerName: '', customerPhone: '', customerEmail: '', customerCuit: '', deliveryAddress: '', notes: '' };

const inputClass = 'mt-1.5 w-full rounded-xl border border-[#d9ccbc] bg-white px-4 py-3 text-base text-[#1F1F1C] outline-none transition-colors placeholder:text-[#9a8f82] focus:border-[#2F5D3A] focus:ring-2 focus:ring-[#2F5D3A]/20';

function Field({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-semibold text-[#2F5D3A]">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-[#6b6258]">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs font-semibold text-[#b3261e]">
          {error}
        </span>
      )}
    </label>
  );
}

export function OrderSection() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [form, setForm] = useState(emptyForm);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('retiro');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [website, setWebsite] = useState(''); // campo trampa para bots
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    fetch('/api/products')
      .then((res) => (res.ok ? (res.json() as Promise<Catalog>) : Promise.reject(new Error('catalog'))))
      .then((data) => {
        if (cancelled) return;
        setCatalog(data);
        if (data.mercadoPago) setPaymentMethod('mercadopago');
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const lines = useMemo(() => {
    if (!catalog) return [];
    return catalog.products
      .map((product) => ({ product, quantity: quantities[product.id] ?? 0 }))
      .filter((line) => line.quantity > 0);
  }, [catalog, quantities]);

  const totalCents = lines.reduce((sum, l) => sum + l.product.priceCents * l.quantity, 0);
  const totalKg = round2(lines.reduce((sum, l) => sum + l.product.unitKg * l.quantity, 0));

  const setQuantity = (product: CatalogProduct, value: number) => {
    const next = Math.min(Math.max(Number.isFinite(value) ? Math.trunc(value) : 0, 0), product.maxQuantity);
    setQuantities((current) => ({ ...current, [product.id]: next }));
  };

  const setField = (name: keyof typeof emptyForm) => (event: { target: { value: string } }) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          ...form,
          deliveryMethod,
          paymentMethod,
          website,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        code?: string;
        checkoutUrl?: string;
        checkoutUnavailable?: boolean;
        error?: string;
        fields?: Record<string, string>;
      };

      if (response.ok && data.code) {
        // Se deja el botón bloqueado: la página va a cambiar de destino
        if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
        else window.location.assign(`/pedido/${data.code}${data.checkoutUnavailable ? '?mp=unavailable' : ''}`);
        return;
      }

      setFieldErrors(data.fields ?? {});
      setError(data.error ?? 'No pudimos registrar tu pedido.');
    } catch {
      setError('No hay conexión. Revisá tu internet e intentá de nuevo.');
    }
    setSubmitting(false);
  }

  const shell = (children: ReactNode) => (
    <section id="pedido" className="section-block bg-[#2F5D3A] text-[#FAF9F6]">
      <div className="section-shell">
        <p data-reveal className="eyebrow !text-[#EDE4D8]">Pedí online</p>
        <h2 data-reveal="1" className="mt-4 max-w-3xl text-balance text-4xl font-bold leading-tight sm:text-5xl">Hacé tu pedido de paltas.</h2>
        <p data-reveal="2" className="mt-4 max-w-2xl text-base leading-relaxed text-[#EDE4D8] sm:text-lg">Elegí cuántas cajas querés y pagá online o por transferencia. Retirás en el campo o coordinamos el envío.</p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );

  if (loadFailed) {
    return shell(<p className="rounded-2xl bg-white/10 p-6 text-[#EDE4D8]">No pudimos cargar los productos en este momento. Escribinos por WhatsApp y te tomamos el pedido.</p>);
  }

  if (!catalog) {
    return shell(<div className="h-64 animate-pulse rounded-3xl bg-white/10" aria-label="Cargando productos" />);
  }

  if (catalog.products.length === 0) {
    return shell(<p className="rounded-2xl bg-white/10 p-6 text-[#EDE4D8]">Pronto habilitamos los pedidos online. Mientras tanto, escribinos por WhatsApp o email y coordinamos tu pedido.</p>);
  }

  const canSubmit = lines.length > 0 && !submitting;

  return shell(
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#EDE4D8]">1. Elegí tus cajas</h3>
        {catalog.products.map((product) => {
          const quantity = quantities[product.id] ?? 0;
          return (
            <div key={product.id} className="rounded-2xl bg-[#FAF9F6] p-5 text-[#1F1F1C] shadow-lg">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2F5D3A]">{product.name}</p>
                  {product.description && <p className="mt-1 text-sm text-[#4F473E]">{product.description}</p>}
                  <p className="mt-2 text-sm font-semibold text-[#A66A43]">
                    {formatMoney(product.priceCents)} <span className="font-normal text-[#6b6258]">· {formatKg(product.unitKg)} por unidad</span>
                  </p>
                </div>

                {product.soldOut ? (
                  <span className="rounded-full bg-[#EDE4D8] px-3 py-1 text-xs font-bold text-[#6b6258]">Sin stock</span>
                ) : (
                  <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${product.name}`}>
                    <button type="button" onClick={() => setQuantity(product, quantity - 1)} disabled={quantity === 0} aria-label={`Quitar una ${product.name}`} className="h-11 w-11 rounded-full border border-[#d9ccbc] text-xl font-bold text-[#2F5D3A] transition-colors hover:bg-[#EDE4D8] disabled:opacity-30">
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={product.maxQuantity}
                      value={quantity}
                      onChange={(event) => setQuantity(product, Number(event.target.value))}
                      aria-label={`Cantidad de ${product.name}`}
                      className="h-11 w-16 rounded-xl border border-[#d9ccbc] bg-white text-center text-base font-bold text-[#1F1F1C] outline-none focus:border-[#2F5D3A]"
                    />
                    <button type="button" onClick={() => setQuantity(product, quantity + 1)} disabled={quantity >= product.maxQuantity} aria-label={`Agregar una ${product.name}`} className="h-11 w-11 rounded-full bg-[#2F5D3A] text-xl font-bold text-white transition-colors hover:bg-[#244B2E] disabled:opacity-30">
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {fieldErrors.items && (
          <p role="alert" className="text-sm font-semibold text-[#ffd9d5]">
            {fieldErrors.items}
          </p>
        )}

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5" aria-live="polite">
          {lines.length === 0 ? (
            <p className="text-sm text-[#EDE4D8]">Todavía no elegiste ninguna caja.</p>
          ) : (
            <>
              <ul className="space-y-1 text-sm text-[#EDE4D8]">
                {lines.map((l) => (
                  <li key={l.product.id} className="flex justify-between gap-4">
                    <span>
                      {l.quantity} × {l.product.name}
                    </span>
                    <span>{formatMoney(l.product.priceCents * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-end justify-between border-t border-white/20 pt-4">
                <span className="text-sm text-[#EDE4D8]">Total ({formatKg(totalKg)})</span>
                <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">{formatMoney(totalCents)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-5 rounded-3xl bg-[#FAF9F6] p-6 text-[#1F1F1C] shadow-xl sm:p-8">
        <h3 className="text-lg font-bold text-[#2F5D3A]">2. Tus datos</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre y apellido" error={fieldErrors.customerName}>
            <input value={form.customerName} onChange={setField('customerName')} autoComplete="name" maxLength={80} className={inputClass} />
          </Field>
          <Field label="Teléfono / WhatsApp" error={fieldErrors.customerPhone}>
            <input value={form.customerPhone} onChange={setField('customerPhone')} type="tel" inputMode="tel" autoComplete="tel" maxLength={30} className={inputClass} />
          </Field>
        </div>

        <Field label="Email" error={fieldErrors.customerEmail}>
          <input value={form.customerEmail} onChange={setField('customerEmail')} type="email" inputMode="email" autoComplete="email" maxLength={120} className={inputClass} />
        </Field>

        <Field label="CUIT (opcional, para facturar)" error={fieldErrors.customerCuit}>
          <input value={form.customerCuit} onChange={setField('customerCuit')} inputMode="numeric" maxLength={13} className={inputClass} />
        </Field>

        <fieldset>
          <legend className="text-sm font-semibold text-[#2F5D3A]">¿Cómo lo recibís?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(
              [
                ['retiro', 'Retiro en el campo', 'Colón 1707, Paso de los Libres'],
                ['envio', 'Envío', 'A coordinar por WhatsApp'],
              ] as const
            ).map(([value, title, detail]) => (
              <label key={value} className={`cursor-pointer rounded-xl border-2 p-3 transition-colors ${deliveryMethod === value ? 'border-[#2F5D3A] bg-[#2F5D3A]/5' : 'border-[#d9ccbc]'}`}>
                <input type="radio" name="deliveryMethod" value={value} checked={deliveryMethod === value} onChange={() => setDeliveryMethod(value)} className="sr-only" />
                <span className="block text-sm font-bold text-[#2F5D3A]">{title}</span>
                <span className="block text-xs text-[#6b6258]">{detail}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {deliveryMethod === 'envio' && (
          <Field label="Dirección de entrega" error={fieldErrors.deliveryAddress} hint="El costo del envío se coordina por WhatsApp y no está incluido en el total.">
            <input value={form.deliveryAddress} onChange={setField('deliveryAddress')} autoComplete="street-address" maxLength={200} className={inputClass} />
          </Field>
        )}

        <Field label="Notas (opcional)" error={fieldErrors.notes}>
          <textarea value={form.notes} onChange={setField('notes')} rows={2} maxLength={500} className={inputClass} />
        </Field>

        <fieldset>
          <legend className="text-sm font-semibold text-[#2F5D3A]">3. Medio de pago</legend>
          <div className="mt-2 grid gap-2">
            {(
              [
                ...(catalog.mercadoPago ? [['mercadopago', 'Mercado Pago', 'Tarjeta, débito o dinero en cuenta'] as const] : []),
                ['transferencia', 'Transferencia bancaria', 'Te pasamos los datos por WhatsApp'] as const,
              ] as const
            ).map(([value, title, detail]) => (
              <label key={value} className={`cursor-pointer rounded-xl border-2 p-3 transition-colors ${paymentMethod === value ? 'border-[#2F5D3A] bg-[#2F5D3A]/5' : 'border-[#d9ccbc]'}`}>
                <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="sr-only" />
                <span className="block text-sm font-bold text-[#2F5D3A]">{title}</span>
                <span className="block text-xs text-[#6b6258]">{detail}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Campo trampa: las personas no lo ven, los bots lo completan */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Sitio web
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-[#fdecea] p-3 text-sm font-semibold text-[#b3261e]">
            {error}
          </p>
        )}

        <button type="submit" disabled={!canSubmit} className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#A66A43] px-8 text-base font-bold text-white shadow-lg transition-all hover:bg-[#8C5734] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? 'Enviando…' : paymentMethod === 'mercadopago' ? 'Ir a pagar' : 'Confirmar pedido'}
        </button>
        <p className="text-center text-xs text-[#6b6258]">Usamos tus datos solo para gestionar este pedido.</p>
      </div>
    </form>,
  );
}
