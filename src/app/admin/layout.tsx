import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel | Los 108',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#F3EEE6] text-[#1F1F1C]">{children}</div>;
}
