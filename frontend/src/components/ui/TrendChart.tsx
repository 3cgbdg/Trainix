import { cn } from "@/lib/cn";

export type TrendPoint = {
  label: string;
  values: Record<string, number>;
};

type TrendSeries = {
  key: string;
  label: string;
  color: string;
};

type TrendChartProps = {
  data: TrendPoint[];
  series: TrendSeries[];
  ariaLabel: string;
  emptyMessage?: string;
  className?: string;
};

export function TrendChart({ data, series, ariaLabel, emptyMessage = "Add more check-ins to unlock this trend.", className }: TrendChartProps) {
  const validData = data.filter((point) => series.some((item) => Number.isFinite(point.values[item.key])));

  if (validData.length < 2) {
    return <div className={cn("flex min-h-52 items-center justify-center rounded-control border border-dashed border-border-strong bg-surface-muted px-6 text-center text-sm leading-6 text-muted", className)}>{emptyMessage}</div>;
  }

  const allValues = validData.flatMap((point) => series.map((item) => point.values[item.key]).filter(Number.isFinite));
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const range = Math.max(maximum - minimum, 1);
  const coordinates = (key: string) => validData.map((point, index) => {
    const x = 4 + (index / (validData.length - 1)) * 92;
    const y = 88 - ((point.values[key] - minimum) / range) * 68;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  return (
    <figure className={className}>
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted">
        {series.map((item) => <span key={item.key} className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}
      </div>
      <svg viewBox="0 0 100 100" role="img" aria-label={ariaLabel} className="mt-4 h-52 w-full overflow-visible" preserveAspectRatio="none">
        {[20, 42.5, 65, 87.5].map((y) => <line key={y} x1="4" x2="96" y1={y} y2={y} stroke="var(--border)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />)}
        {series.map((item) => <polyline key={item.key} points={coordinates(item.key)} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <figcaption className="mt-2 flex justify-between gap-2 text-[11px] font-medium text-subtle">
        {validData.map((point, index) => <span key={`${point.label}-${index}`} className="truncate">{point.label}</span>)}
      </figcaption>
    </figure>
  );
}
