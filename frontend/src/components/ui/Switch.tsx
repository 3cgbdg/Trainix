"use client";

import { cn } from "@/lib/cn";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function Switch({ checked, onCheckedChange, label, description, disabled = false }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="font-semibold text-strong">{label}</div>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full border p-0.5 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          checked ? "border-brand bg-brand" : "border-border-strong bg-surface-muted",
        )}
      >
        <span aria-hidden="true" className={cn("block size-5 rounded-full bg-surface transition-transform duration-200", checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}
