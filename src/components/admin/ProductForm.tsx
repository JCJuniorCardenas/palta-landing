'use client';

import { startTransition, useActionState, useEffect, useRef } from 'react';
import { saveProductAction, type FormState } from '@/app/admin/actions';
import { centsToPesosInput } from '@/lib/money';
import type { Product } from '@/lib/orders';

const input = 'mt-1 w-full rounded-lg border border-[#d9ccbc] bg-white px-3 py-2 text-sm outline-none focus:border-[#2F5D3A] focus:ring-2 focus:ring-[#2F5D3A]/20';
const label = 'block text-xs font-bold text-[#4F473E]';

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const isNew = !product;

  // Al crear un producto, el formulario queda limpio para cargar otro
  useEffect(() => {
    if (isNew && state.saved) formRef.current?.reset();
  }, [isNew, state.saved]);

  return (
    <form
      ref={formRef}
      // Con onSubmit (y no con action=) React no borra los campos cuando hay un error de validación
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      className="rounded-2xl border border-[#E5DED3] bg-white p-4 sm:p-5"
    >
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className={label}>
          Nombre
          <input name="name" defaultValue={product?.name} required maxLength={80} className={input} />
        </label>
        <label className={label}>
          Kilos por unidad
          <input name="unitKg" defaultValue={product?.unitKg} required inputMode="decimal" className={input} />
        </label>
        <label className={label}>
          Precio (pesos)
          <input name="price" defaultValue={product ? centsToPesosInput(product.priceCents) : ''} required inputMode="decimal" placeholder="25000" className={input} />
        </label>
        <label className={label}>
          Stock (unidades)
          <input name="stock" defaultValue={product?.stockUnits ?? ''} inputMode="numeric" placeholder="Sin control" className={input} />
        </label>
      </div>

      <label className={`${label} mt-3`}>
        Descripción (opcional)
        <input name="description" defaultValue={product?.description} maxLength={200} className={input} />
      </label>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#2F5D3A]">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-5 w-5 accent-[#2F5D3A]" />
          Visible en la tienda
        </label>

        <div className="flex items-center gap-3">
          {state.error && (
            <span role="alert" className="text-sm font-semibold text-[#b3261e]">
              {state.error}
            </span>
          )}
          {!state.error && state.saved && <span className="text-sm font-semibold text-[#1f5a2b]">Guardado ✓</span>}
          <button type="submit" disabled={pending} className="inline-flex min-h-10 items-center rounded-full bg-[#2F5D3A] px-6 text-sm font-bold text-white transition-colors hover:bg-[#244B2E] disabled:opacity-60">
            {pending ? 'Guardando…' : isNew ? 'Agregar producto' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
}
