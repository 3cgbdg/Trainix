import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "@/components/ui/buttonStyles";

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
};

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  leadingIcon,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {leadingIcon}
      {children}
    </Link>
  );
}
