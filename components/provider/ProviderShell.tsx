"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/shared/Logo";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Avatar } from "@/components/shared/Avatar";
import { Icons } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/helpers";
import { ReactNode } from "react";

const links = [
  { href: "/provider/dashboard", label: "Dashboard", icon: Icons.grid },
  { href: "/provider/patients", label: "Patients", icon: Icons.users },
  { href: "/provider/alerts", label: "Alerts", icon: Icons.bell },
  { href: "/provider/referrals", label: "Referrals", icon: Icons.pin },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function ProviderShell({
  name,
  children,
  activeAlertCount = 0,
}: {
  name: string;
  children: ReactNode;
  activeAlertCount?: number;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-canvas bg-mesh-warm">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line/70 bg-white/90 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Provider">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sage-light text-navy shadow-sm"
                    : "text-ink-muted hover:bg-sage-light hover:text-navy"
                )}
              >
                <l.icon size={18} />
                <span className="flex-1">{l.label}</span>
                {l.href === "/provider/alerts" && activeAlertCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-heading font-bold text-white">
                    {activeAlertCount > 9 ? "9+" : activeAlertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <div className="mb-1 flex items-center gap-3">
            <Avatar name={name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">{name}</p>
              <p className="text-caption text-ink-muted">Clinician</p>
            </div>
            <NotificationBell />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3 justify-start px-2"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <Icons.logout size={16} />
            Sign out
          </Button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line/70 bg-canvas/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <Icons.logout size={16} />
              Sign out
            </Button>
          </div>
        </header>
        <div className="px-4 py-6 pb-24 sm:px-8">{children}</div>
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line/70 bg-white/95 backdrop-blur-xl lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-semibold",
                isActive(pathname, l.href) ? "text-primary" : "text-ink-muted"
              )}
            >
              <span className="relative">
                <l.icon size={18} />
                {l.href === "/provider/alerts" && activeAlertCount > 0 && (
                  <span className="absolute -right-2 -top-1 h-1.5 w-1.5 rounded-full bg-danger" />
                )}
              </span>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
