import { cn } from "@/lib/utils/helpers";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "inverse" | "ghostDark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-card disabled:bg-primary/50",
  secondary: "bg-navy text-white hover:bg-navy-muted disabled:bg-navy/50",
  ghost: "bg-transparent text-navy hover:bg-sage-light",
  danger: "bg-danger text-white hover:bg-danger-dark",
  outline: "border border-line bg-white text-navy hover:border-navy hover:shadow-card",
  inverse: "bg-white text-navy shadow-sm hover:bg-white/90 disabled:bg-white/50",
  ghostDark:
    "border border-white/35 bg-white/10 text-white hover:bg-white/20 disabled:bg-white/5",
};

const sizes: Record<Size, string> = {
  sm: "h-10 min-w-[2.5rem] px-4 text-sm",
  md: "h-11 min-w-[2.75rem] px-5 text-sm",
  lg: "h-12 min-w-[3rem] px-6 text-base",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-heading font-semibold tracking-[0.02em] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className={cn(
            "h-4 w-4 animate-spin rounded-full border-2",
            variant === "inverse" || variant === "outline" || variant === "ghost"
              ? "border-navy/25 border-t-navy"
              : "border-white/40 border-t-white"
          )}
        />
      )}
      {children}
    </button>
  );
});
