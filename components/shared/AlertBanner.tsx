"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/helpers";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  info: "bg-primary-soft text-primary-dark border-primary/20",
  success: "bg-success-soft text-success-ink border-success/20",
  warning: "bg-warning-soft text-warning-ink border-warning/20",
  danger: "bg-danger-soft text-danger-ink border-danger/20",
};

export function AlertBanner({
  title,
  children,
  tone = "info",
}: {
  title: string;
  children?: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-2xl border px-4 py-3", tones[tone])}
      role="alert"
    >
      <p className="text-sm font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm">{children}</div>}
    </motion.div>
  );
}
