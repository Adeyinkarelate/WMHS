"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Avatar } from "@/components/shared/Avatar";
import { Icons } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/helpers";
import { ReactNode } from "react";

const links = [
  { href: "/patient/dashboard", label: "Home", icon: Icons.home },
  { href: "/patient/symptoms", label: "Symptoms", icon: Icons.pulse },
  { href: "/patient/tests", label: "Tests", icon: Icons.flask },
  { href: "/patient/risk-results", label: "Risk", icon: Icons.shield },
  { href: "/patient/alerts", label: "Alerts", icon: Icons.bell },
  { href: "/patient/referrals", label: "Referrals", icon: Icons.pin },
  { href: "/patient/history", label: "History", icon: Icons.clock },
  { href: "/patient/assistant", label: "Assistant", icon: Icons.chat },
  { href: "/patient/profile", label: "Profile", icon: Icons.user },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function PatientShell({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const primary = links.slice(0, 4);
  const extra = links.slice(4);

  return (
    <div className="min-h-screen bg-canvas bg-mesh-warm">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line/70 bg-white/90 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Patient">
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
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar name={name} size="sm" />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{name}</p>
            <NotificationBell />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start px-2"
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
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              type="button"
              className="rounded-xl p-2 text-navy"
              aria-label="More"
              onClick={() => setMore(true)}
            >
              <Icons.menu />
            </button>
          </div>
        </header>
        <div className="px-4 py-6 pb-28 sm:px-8">{children}</div>
        <nav
          className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line/70 bg-white/95 backdrop-blur-xl lg:hidden"
          aria-label="Patient mobile"
        >
          {primary.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold",
                isActive(pathname, l.href) ? "text-primary" : "text-ink-muted"
              )}
            >
              <l.icon size={18} />
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            className="flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold text-ink-muted"
            onClick={() => setMore(true)}
          >
            <Icons.more size={18} />
            More
          </button>
        </nav>
        <AnimatePresence>
          {more && (
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                className="absolute inset-0 bg-navy/40"
                aria-label="Close menu"
                onClick={() => setMore(false)}
              />
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 pb-8 shadow-lift"
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
                <div className="mb-4 flex items-center gap-3">
                  <Avatar name={name} />
                  <div>
                    <p className="font-semibold text-navy">{name}</p>
                    <p className="text-caption text-ink-muted">Patient record</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {extra.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMore(false)}
                      className="flex items-center gap-2 rounded-2xl bg-canvas px-3 py-3 text-sm font-semibold text-navy"
                    >
                      <l.icon size={16} />
                      {l.label}
                    </Link>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-4 justify-start px-2"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <Icons.logout size={16} />
                  Sign out
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
