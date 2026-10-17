'use client';

import { useActionState } from 'react';
import { loginAction, type FormState } from '@/app/admin/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-semibold text-[#2F5D3A]">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="mt-1.5 w-full rounded-xl border border-[#d9ccbc] bg-white px-4 py-3 text-base outline-none focus:border-[#2F5D3A] focus:ring-2 focus:ring-[#2F5D3A]/20"
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-[#fdecea] p-3 text-sm font-semibold text-[#b3261e]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#2F5D3A] px-6 text-base font-bold text-white transition-colors hover:bg-[#244B2E] disabled:opacity-60">
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
