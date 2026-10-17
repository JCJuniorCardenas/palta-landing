'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Vuelve a pedirle los datos al servidor cada tanto, sin recargar la página. Se pausa si la pestaña está oculta. */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds]);

  return null;
}
