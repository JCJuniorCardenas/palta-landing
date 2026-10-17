'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminConfigured, checkPassword, endAdminSession, requireAdmin, startAdminSession } from '@/lib/auth';
import { pesosToCents } from '@/lib/money';
import { applyOrderAction, createProduct, updateProduct, type OrderAction, type ProductInput } from '@/lib/orders';
import { allow, clientIp, isBlocked } from '@/lib/rate-limit';

export type FormState = { error?: string; saved?: number };

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW = 15 * 60 * 1000;

export async function loginAction(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!adminConfigured()) {
    return { error: 'El panel todavía no está configurado: faltan las variables ADMIN_PASSWORD y SESSION_SECRET.' };
  }

  const key = `login:${clientIp(await headers())}`;
  if (isBlocked(key, LOGIN_LIMIT, LOGIN_WINDOW)) {
    return { error: 'Demasiados intentos fallidos. Esperá 15 minutos y probá de nuevo.' };
  }

  if (!checkPassword(String(formData.get('password') ?? ''))) {
    allow(key, LOGIN_LIMIT, LOGIN_WINDOW); // solo se cuentan los intentos fallidos
    return { error: 'Contraseña incorrecta.' };
  }

  await startAdminSession();
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect('/admin/login');
}

const ACTIONS: OrderAction[] = ['confirm_payment', 'deliver', 'cancel'];

/** Se usa con .bind(null, orderId, action) desde los botones del panel. */
export async function runOrderAction(orderId: string, action: OrderAction): Promise<void> {
  await requireAdmin();
  if (!ACTIONS.includes(action)) return;

  await applyOrderAction(orderId, action);
  revalidatePath('/admin', 'layout');
}

function parseProduct(formData: FormData): { value: ProductInput } | { error: string } {
  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2 || name.length > 80) return { error: 'El nombre debe tener entre 2 y 80 caracteres.' };

  const description = String(formData.get('description') ?? '').trim();
  if (description.length > 200) return { error: 'La descripción puede tener hasta 200 caracteres.' };

  const unitKg = Number(String(formData.get('unitKg') ?? '').replace(',', '.'));
  if (!Number.isFinite(unitKg) || unitKg <= 0 || unitKg > 1000) return { error: 'Los kilos por unidad deben ser un número mayor a 0.' };

  const priceCents = pesosToCents(String(formData.get('price') ?? ''));
  if (priceCents === null || priceCents > 1_000_000_000) return { error: 'Ingresá un precio válido en pesos (por ejemplo 25000).' };

  const stockRaw = String(formData.get('stock') ?? '').trim();
  let stockUnits: number | null = null;
  if (stockRaw !== '') {
    stockUnits = Number(stockRaw);
    if (!Number.isInteger(stockUnits) || stockUnits < 0 || stockUnits > 1_000_000) {
      return { error: 'El stock debe ser un número entero (o dejalo vacío para no controlarlo).' };
    }
  }

  return {
    value: { name, description, unitKg: Math.round(unitKg * 100) / 100, priceCents, stockUnits, active: formData.get('active') === 'on' },
  };
}

export async function saveProductAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = parseProduct(formData);
  if ('error' in parsed) return { error: parsed.error };

  const idRaw = String(formData.get('id') ?? '');
  if (idRaw) {
    const id = Number(idRaw);
    if (!Number.isInteger(id) || !(await updateProduct(id, parsed.value))) return { error: 'No se encontró el producto.' };
  } else {
    await createProduct(parsed.value);
  }

  revalidatePath('/admin/productos');
  return { saved: Date.now() };
}
