import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { isAdmin } from '@/lib/auth';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-[#d9ccbc] bg-white p-8 shadow-sm">
        <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2F5D3A]">Los 108</p>
        <p className="mt-1 text-sm text-[#6b6258]">Panel de administración</p>
        <LoginForm />
      </div>
    </main>
  );
}
