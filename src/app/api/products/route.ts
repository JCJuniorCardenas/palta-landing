import { NextResponse } from 'next/server';
import { isMercadoPagoEnabled } from '@/lib/mercadopago';
import { listProducts } from '@/lib/orders';

/** Catálogo público: solo productos activos y sin datos internos. */
export async function GET() {
  try {
    const products = await listProducts({ onlyActive: true });

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        unitKg: p.unitKg,
        priceCents: p.priceCents,
        // Solo se informa si hay stock; el número exacto es interno
        soldOut: p.stockUnits !== null && p.stockUnits <= 0,
        maxQuantity: p.stockUnits === null ? 999 : Math.min(p.stockUnits, 999),
      })),
      mercadoPago: isMercadoPagoEnabled(),
    });
  } catch (error) {
    console.error('[api/products]', error);
    return NextResponse.json({ error: 'No pudimos cargar los productos.' }, { status: 500 });
  }
}
