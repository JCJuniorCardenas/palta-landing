import type { Metadata } from 'next';
import { ProductForm } from '@/components/admin/ProductForm';
import { requireAdmin } from '@/lib/auth';
import { listProducts } from '@/lib/orders';

export const metadata: Metadata = { title: 'Productos | Panel Los 108' };

export default async function ProductsPage() {
  await requireAdmin();
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2F5D3A]">Productos y precios</h1>
        <p className="text-sm text-[#6b6258]">Lo que cargues acá es lo que se ve y se cobra en la tienda de la página.</p>
      </div>

      <div className="rounded-2xl border border-[#e8d9a8] bg-[#fbf3d9] p-4 text-sm text-[#6b5410]">
        <strong>Los productos iniciales son de ejemplo.</strong> Cambiá nombres, kilos y precios por los reales antes de publicar. Si dejás el stock vacío, no se controla; si cargás un número, se descuenta con cada pedido y se devuelve al cancelarlo.
      </div>

      <section aria-label="Productos cargados" className="space-y-3">
        {products.map((product) => (
          <div key={product.id}>
            {!product.active && <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#898781]">Oculto en la tienda</p>}
            <ProductForm product={product} />
          </div>
        ))}
      </section>

      <section aria-label="Nuevo producto">
        <h2 className="mb-3 font-bold">Agregar un producto nuevo</h2>
        <ProductForm />
      </section>
    </div>
  );
}
