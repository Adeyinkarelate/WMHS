import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/helpers";

export function Logo({
  className,
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <Link href="/" aria-label="WMHS home" className={cn("group flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative h-10 w-10 shrink-0 overflow-hidden rounded-[0.85rem] shadow-sm transition-transform duration-300 group-hover:scale-105",
          dark && "ring-2 ring-white/30 shadow-md"
        )}
      >
        <Image
          src="/logo.png"
          alt=""
          width={80}
          height={80}
          className="h-full w-full object-cover"
          priority
        />
      </span>
      <span className="leading-tight">
        <span className={cn("block font-heading text-sm font-bold tracking-wide", dark ? "text-white" : "text-navy")}>
          WMHS
        </span>
        <span className={cn("block text-[11px] font-medium", dark ? "text-white/70" : "text-ink-muted")}>
          Maternal Health
        </span>
      </span>
    </Link>
  );
}
