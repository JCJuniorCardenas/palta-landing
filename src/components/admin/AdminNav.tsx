'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/productos', label: 'Productos' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel" className="flex gap-1">
      {links.map((link) => {
        const current = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={current ? 'page' : undefined} className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${current ? 'bg-[#2F5D3A] text-white' : 'text-[#4F473E] hover:bg-[#EDE4D8]'}`}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
