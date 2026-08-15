import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "muted" | "brand";
  padding?: "none" | "sm" | "md" | "lg";
};

const variants = {
  default: "border-border bg-surface",
  muted: "border-border bg-surface-muted",
  brand: "border-brand/20 bg-brand-soft",
};

const paddings = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Surface({ className, variant = "default", padding = "md", ...props }: SurfaceProps) {
  return <div className={cn("rounded-card border", variants[variant], paddings[padding], className)} {...props} />;
}
