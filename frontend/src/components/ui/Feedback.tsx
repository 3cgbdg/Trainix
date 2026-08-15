import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function Spinner({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-brand border-r-transparent" />
      <span>{label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-pulse rounded-control bg-surface-strong", className)} />;
}

type EmptyStateProps = { title: string; description: string; icon?: ReactNode; action?: ReactNode };

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-12 text-center">
      {icon ? <div aria-hidden="true" className="mb-4 text-brand">{icon}</div> : null}
      <h2 className="text-xl font-semibold text-strong">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

type ErrorStateProps = { title?: string; description?: string; onRetry?: () => void };

export function ErrorState({ title = "Something went wrong", description = "We could not load this part of Trainix. Your saved data has not been changed.", onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="mx-auto flex max-w-lg flex-col items-center px-6 py-12 text-center">
      <div aria-hidden="true" className="mb-4 flex size-11 items-center justify-center rounded-full bg-danger-soft font-bold text-danger">!</div>
      <h2 className="text-xl font-semibold text-strong">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {onRetry ? <Button className="mt-6" onClick={onRetry}>Try again</Button> : null}
    </div>
  );
}
