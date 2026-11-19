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
  { href: "/admin/dashboard", label: "Overview", icon: Icons.grid },
  { href: "/admin/users", label: "Users", icon: Icons.users },
  { href: "/admin/assignments", label: "Assignments", icon: Icons.link },
  { href: "/admin/audit", label: "Audit log", icon: Icons.clipboard },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-canvas bg-mesh-warm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-navy"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line/70 bg-white/90 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Administrator">
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
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <div className="mb-1 flex items-center gap-3">
            <Avatar name={name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">{name}</p>
              <p className="text-caption text-ink-muted">Administrator</p>
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
            <Button type="button" variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              <Icons.logout size={16} />
              Sign out
            </Button>
          </div>
        </header>
        <main id="main-content" className="px-4 py-6 pb-24 sm:px-8">
          {children}
        </main>
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
              <l.icon size={18} />
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
