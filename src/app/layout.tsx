import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-ui',
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Los 108 | Campo de Paltas en Corrientes',
  description: 'Los 108: paltas de origen en Paso de los Libres, Corrientes. Cosecha cuidada, recetas, conservacion y visitas al campo.',
  openGraph: {
    title: 'Los 108 | Paltas de origen en Corrientes',
    description: 'Conoce de donde viene la palta, como se cosecha y como conservarla. Contacto y visitas al campo.',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Los 108 | Campo de Paltas',
    description: 'Paltas de origen, recetas y conservacion en un solo lugar.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} ${fraunces.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
