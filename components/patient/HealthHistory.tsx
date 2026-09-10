"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatDate } from "@/lib/utils/formatters";

export function HealthHistory({
  tests,
}: {
  tests: Array<{ id: string; testType: string; resultValue: number; testDate: string | Date }>;
}) {
  const bp = tests
    .filter((t) => t.testType.toLowerCase().includes("systolic"))
    .map((t) => ({ date: formatDate(t.testDate), value: t.resultValue }))
    .reverse();
  const glucose = tests
    .filter((t) => t.testType.toLowerCase().includes("glucose"))
    .map((t) => ({ date: formatDate(t.testDate), value: t.resultValue }))
    .reverse();

  if (bp.length < 2 && glucose.length < 2) {
    return <p className="text-sm text-ink-muted">Add a few vitals to see trends.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {bp.length >= 2 && (
        <div className="h-56">
          <p className="mb-2 text-sm font-semibold text-navy">Systolic BP</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bp}>
              <CartesianGrid stroke="#D4DCE6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1A56B0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {glucose.length >= 2 && (
        <div className="h-56">
          <p className="mb-2 text-sm font-semibold text-navy">Blood glucose</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={glucose}>
              <CartesianGrid stroke="#D4DCE6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2F6B5D" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
