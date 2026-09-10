import { cn } from "@/lib/utils/helpers";

type Tone = "default" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  default: "bg-sage-light text-sage",
  success: "bg-success-soft text-success-ink ring-1 ring-success/20",
  warning: "bg-warning-soft text-warning-ink ring-1 ring-warning/20",
  danger: "bg-danger-soft text-danger-ink ring-1 ring-danger/20",
  info: "bg-primary-soft text-primary-dark ring-1 ring-primary/20",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-caption font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
