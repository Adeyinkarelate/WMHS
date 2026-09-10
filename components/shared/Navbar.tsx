"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/shared/Icons";

const links = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#features", label: "Care" },
  { href: "/#providers", label: "Stories" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 shadow-card backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 font-heading text-sm font-semibold text-ink-muted transition-colors hover:bg-sage-light hover:text-navy"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2.5 md:flex">
          <Link href="/login">
            <Button
              size="sm"
              variant="outline"
              className="min-w-[5.75rem] border-navy/25 bg-white text-navy shadow-none hover:border-navy hover:bg-sage-light"
            >
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="min-w-[7.5rem] shadow-sm">
              Get started
              <Icons.arrowUp size={14} />
            </Button>
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-navy shadow-sm transition-colors hover:border-navy/30 hover:bg-sage-light md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Icons.close /> : <Icons.menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 font-heading text-sm font-semibold text-navy hover:bg-sage-light"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-navy/25 bg-white text-navy shadow-none hover:border-navy hover:bg-sage-light"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">
                    Get started
                    <Icons.arrowUp size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
