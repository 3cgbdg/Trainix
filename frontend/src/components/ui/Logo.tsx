type LogoProps = {
  className?: string;
  size?: number;
};

// Abstract viewfinder mark: brand-green squircle, scan-corner brackets, and a
// focus point — nods to the AI photo-scan flow without literal fitness clipart.
export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--brand)" />
      <g stroke="var(--on-brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M7.5 12.5V9A1.5 1.5 0 0 1 9 7.5h3.5" />
        <path d="M24.5 12.5V9A1.5 1.5 0 0 0 23 7.5h-3.5" />
        <path d="M7.5 19.5V23A1.5 1.5 0 0 0 9 24.5h3.5" />
        <path d="M24.5 19.5V23a1.5 1.5 0 0 1-1.5 1.5h-3.5" />
      </g>
      <circle cx="16" cy="16" r="3" fill="var(--on-brand)" />
    </svg>
  );
}
