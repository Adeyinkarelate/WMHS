import { ReactNode } from "react";
import { cn } from "@/lib/utils/helpers";

/**
 * CSS-based reveals. Framer Motion was painting `opacity: 0` into the SSR HTML
 * and then never completing `whileInView` / enter animations, which hid the
 * landing hero copy and every section below it.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={cn("animate-fade-up", className)} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("stagger-fade", className)}>{children}</div>;
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={cn("animate-fade-up", className)} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}
