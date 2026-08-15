"use client";

import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SharedFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
};

function FieldHeader({ label, optional }: Pick<SharedFieldProps, "label" | "optional">) {
  return (
    <span className="flex items-center justify-between gap-3 text-sm font-semibold text-strong">
      <span>{label}</span>
      {optional ? <span className="text-xs font-normal text-subtle">Optional</span> : null}
    </span>
  );
}

function FieldMessage({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  const message = error || hint;
  if (!message) return null;

  return (
    <span id={id} role={error ? "alert" : undefined} className={cn("text-sm", error ? "text-danger" : "text-muted")}>
      {message}
    </span>
  );
}

export type TextFieldProps = SharedFieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, optional, id: providedId, className, ...props },
  ref,
) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const messageId = `${id}-message`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id}>
        <FieldHeader label={label} optional={optional} />
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={hint || error ? messageId : undefined}
        className={cn(
          "min-h-11 w-full rounded-control border bg-surface px-3 text-base text-strong outline-none transition-colors placeholder:text-subtle",
          "border-border hover:border-border-strong focus:border-brand focus:ring-2 focus:ring-focus/25 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
          error ? "border-danger focus:border-danger focus:ring-danger/20" : undefined,
        )}
        {...props}
      />
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
});

export type SelectFieldProps = SharedFieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className">;

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, optional, id: providedId, className, children, ...props },
  ref,
) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const messageId = `${id}-message`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id}>
        <FieldHeader label={label} optional={optional} />
      </label>
      <select
        ref={ref}
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={hint || error ? messageId : undefined}
        className={cn(
          "min-h-11 w-full rounded-control border bg-surface px-3 text-base text-strong outline-none transition-colors",
          "border-border hover:border-border-strong focus:border-brand focus:ring-2 focus:ring-focus/25 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
          error ? "border-danger focus:border-danger focus:ring-danger/20" : undefined,
        )}
        {...props}
      >
        {children}
      </select>
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
});
