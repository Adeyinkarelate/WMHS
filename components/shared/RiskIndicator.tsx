"use client";

import { cn } from "@/lib/utils/helpers";
import { riskLabel } from "@/lib/utils/formatters";
import type { RiskLevel } from "@/types";
import { motion } from "framer-motion";

const styles: Record<RiskLevel, { wrap: string; dot: string; bar: string }> = {
  LOW: {
    wrap: "bg-success-soft border-success/20 text-success-ink",
    dot: "bg-success",
    bar: "bg-success",
  },
  MEDIUM: {
    wrap: "bg-warning-soft border-warning/20 text-warning-ink",
    dot: "bg-warning",
    bar: "bg-warning",
  },
  HIGH: {
    wrap: "bg-danger-soft border-danger/20 text-danger-ink",
    dot: "bg-danger",
    bar: "bg-danger",
  },
};

export function RiskIndicator({
  level,
  score,
  compact = false,
}: {
  level: RiskLevel;
  score?: number;
  compact?: boolean;
}) {
  const s = styles[level];
  return (
    <div className={cn("rounded-2xl border p-5 shadow-card", s.wrap)}>
      <div className="flex items-center gap-3">
        <motion.span
          className={cn("h-3 w-3 rounded-full", s.dot)}
          animate={level === "HIGH" ? { scale: [1, 1.25, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <p className="text-sm font-semibold uppercase tracking-wide">{riskLabel(level)} risk</p>
      </div>
      {!compact && typeof score === "number" && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-caption">
            <span>Risk score</span>
            <span className="font-semibold">{Math.round(score * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/70">
            <motion.div
              className={cn("h-full rounded-full", s.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(score * 100)}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
