import { formatDayKey } from '@/lib/dates';
import { formatKg, formatMoney, formatNumber } from '@/lib/money';
import type { DayPoint } from '@/lib/stats';

type BarChartProps = {
  title: string;
  subtitle: string;
  points: DayPoint[];
  metric: 'revenue' | 'kg';
  color: string;
};

/** Redondea hacia arriba a 1, 2, 5 o 10 × 10^n para que los ejes tengan números limpios. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const fraction = value / magnitude;
  return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * magnitude;
}

function tickLabel(value: number, metric: 'revenue' | 'kg'): string {
  if (metric === 'kg') return value === 0 ? '0' : formatNumber(value);
  const pesos = value / 100;
  if (pesos === 0) return '0';
  if (pesos >= 1_000_000) return `$${formatNumber(pesos / 1_000_000)} M`;
  if (pesos >= 1_000) return `$${formatNumber(pesos / 1_000)} mil`;
  return `$${formatNumber(pesos)}`;
}

/** Barras HTML/CSS: hasta 24 px de ancho, esquina superior redondeada, 3 líneas de guía. Sin JavaScript. */
export function BarChart({ title, subtitle, points, metric, color }: BarChartProps) {
  const values = points.map((p) => (metric === 'revenue' ? p.revenueCents : p.kg));
  const max = niceMax(Math.max(0, ...values));
  const ticks = [0, max / 2, max];
  const hasData = values.some((v) => v > 0);
  const valueText = (v: number) => (metric === 'revenue' ? formatMoney(v) : formatKg(v));

  return (
    <figure className="rounded-2xl border border-[#E5DED3] bg-white p-5">
      <figcaption>
        <span className="block font-bold text-[#1F1F1C]">{title}</span>
        <span className="block text-sm text-[#6b6258]">{subtitle}</span>
      </figcaption>

      {!hasData ? (
        <p className="mt-6 rounded-xl bg-[#F3EEE6] p-6 text-center text-sm text-[#6b6258]">Todavía no hay ventas confirmadas en este período.</p>
      ) : (
        <>
          <div className="relative mt-8 h-52">
            {ticks.map((tick) => (
              <div key={tick} className="absolute inset-x-0 flex items-center" style={{ bottom: `${(tick / max) * 100}%` }}>
                <span className="w-16 shrink-0 whitespace-nowrap pr-2 text-right text-[11px] text-[#898781]">{tickLabel(tick, metric)}</span>
                <span className={`h-px flex-1 ${tick === 0 ? 'bg-[#C3C2B7]' : 'bg-[#E1E0D9]'}`} />
              </div>
            ))}

            <div className="absolute inset-y-0 left-16 right-0 flex items-end gap-[3px]">
              {points.map((point, index) => {
                const value = values[index];
                const align = index < points.length * 0.25 ? 'left-0' : index > points.length * 0.75 ? 'right-0' : 'left-1/2 -translate-x-1/2';
                const text = `${formatDayKey(point.day)}: ${valueText(value)} · ${point.orders} ${point.orders === 1 ? 'pedido' : 'pedidos'}`;

                return (
                  <div key={point.day} tabIndex={0} aria-label={text} className="group relative flex h-full flex-1 items-end justify-center outline-none">
                    <div className="w-full max-w-[24px] rounded-t-[4px] transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80" style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? 3 : 0, backgroundColor: color }} />
                    <span role="tooltip" className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-lg bg-[#1F1F1C] px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block group-focus-visible:block ${align}`}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex justify-between pl-16 text-[11px] text-[#898781]" aria-hidden="true">
            <span>{formatDayKey(points[0].day)}</span>
            <span>{formatDayKey(points[Math.floor(points.length / 2)].day)}</span>
            <span>{formatDayKey(points[points.length - 1].day)}</span>
          </div>

          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-semibold text-[#2F5D3A]">Ver como tabla</summary>
            <table className="mt-2 w-full text-left">
              <thead className="text-xs text-[#6b6258]">
                <tr>
                  <th className="py-1 font-semibold">Día</th>
                  <th className="py-1 text-right font-semibold">{metric === 'revenue' ? 'Ingresos' : 'Kilos'}</th>
                  <th className="py-1 text-right font-semibold">Pedidos</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {[...points].reverse().map((point) => (
                  <tr key={point.day} className="border-t border-[#EDE4D8]">
                    <td className="py-1">{formatDayKey(point.day)}</td>
                    <td className="py-1 text-right">{valueText(metric === 'revenue' ? point.revenueCents : point.kg)}</td>
                    <td className="py-1 text-right">{point.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </figure>
  );
}
