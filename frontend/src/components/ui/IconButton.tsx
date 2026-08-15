"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> & {
  label: string;
  icon: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = "ghost", ...props },
  ref,
) {
  return (
    <Button ref={ref} size="icon" variant={variant} aria-label={label} title={label} {...props}>
      <span aria-hidden="true">{icon}</span>
    </Button>
  );
});
