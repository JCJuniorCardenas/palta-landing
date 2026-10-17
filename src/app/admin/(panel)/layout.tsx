import Link from 'next/link';
import { logoutAction } from '@/app/admin/actions';
import { AdminNav } from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <>
      <header className="border-b border-[#E5DED3] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2F5D3A]">Los 108</span>
            <AdminNav />
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="text-[#4F473E] underline-offset-2 hover:underline">
              Ver sitio
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-full border border-[#d9ccbc] px-4 py-1.5 text-[#4F473E] transition-colors hover:bg-[#EDE4D8]">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </>
  );
}
