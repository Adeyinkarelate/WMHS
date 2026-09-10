import { cn } from "@/lib/utils/helpers";

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-navy font-bold text-white shadow-sm",
        sizes[size],
        className
      )}
      aria-hidden
    >
      {initials || "W"}
    </span>
  );
}
