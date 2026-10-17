import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'l108_admin';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function sessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

/** El panel solo funciona si están ADMIN_PASSWORD y SESSION_SECRET (mínimo 16 caracteres). */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && sessionSecret() !== null;
}

const sha256 = (value: string) => createHash('sha256').update(value).digest();

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Se comparan hashes (largo fijo) para no filtrar el largo ni el contenido por tiempo
  return timingSafeEqual(sha256(input), sha256(expected));
}

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret() ?? '').update(payload).digest('hex');
}

function verifyToken(token: string | undefined): boolean {
  if (!token || !sessionSecret()) return false;

  const [expires, signature] = token.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;

  const expected = Buffer.from(sign(expires), 'hex');
  const received = Buffer.from(signature, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function isAdmin(): Promise<boolean> {
  return verifyToken((await cookies()).get(COOKIE)?.value);
}

/** Cada página y cada acción del panel debe llamar a esto: las acciones del servidor son endpoints públicos. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}

export async function startAdminSession(): Promise<void> {
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
