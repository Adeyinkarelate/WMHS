import { cn } from "@/lib/utils/helpers";
import { HTMLAttributes } from "react";

export function Card({
  className,
  padding = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { padding?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line/80 bg-white shadow-card transition-shadow duration-300",
        padding && "p-5 sm:p-6",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-heading text-h3 text-navy", className)} {...props} />;
}
