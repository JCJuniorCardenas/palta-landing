const TZ = 'America/Argentina/Buenos_Aires';

const dateTime = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short', timeZone: TZ });

export function formatDateTime(date: Date): string {
  return dateTime.format(date);
}

/** '2026-10-17' -> '17/10' */
export function formatDayKey(key: string): string {
  const [, month, day] = key.split('-');
  return `${day}/${month}`;
}
