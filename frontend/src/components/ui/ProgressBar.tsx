import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  className?: string;
  indicatorClassName?: string;
};

export function ProgressBar({ value, max = 100, label, className, indicatorClassName }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(value, safeMax)) : 0;
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
      className={cn("h-2 overflow-hidden rounded-full bg-surface-strong", className)}
    >
      <div
        className={cn("h-full rounded-full bg-brand transition-[width] duration-500", indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
