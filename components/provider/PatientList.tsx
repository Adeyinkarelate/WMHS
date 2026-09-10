"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar } from "@/components/shared/Avatar";
import type { RiskLevel } from "@/types";

type Row = {
  id: string;
  name: string;
  email: string;
  risk: RiskLevel | string;
  score: number;
  alerts: number;
};

export function PatientList({ patients }: { patients: Row[] }) {
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState("ALL");
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchQ =
        !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.email.toLowerCase().includes(q.toLowerCase());
      const matchR = risk === "ALL" || p.risk === risk;
      return matchQ && matchR;
    });
  }, [patients, q, risk]);

  const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, UNASSESSED: 3 };
  const sorted = [...filtered].sort((a, b) => (order[a.risk] ?? 9) - (order[b.risk] ?? 9));

  return (
    <Card>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Input
          label="Search patients"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name or email"
        />
        <Select
          label="Risk"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          options={[
            { value: "ALL", label: "All" },
            { value: "HIGH", label: "High" },
            { value: "MEDIUM", label: "Medium" },
            { value: "LOW", label: "Low" },
            { value: "UNASSESSED", label: "Not assessed" },
          ]}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-caption uppercase text-ink-muted">
              <th className="py-2 font-semibold">Patient</th>
              <th className="py-2 font-semibold">Risk</th>
              <th className="py-2 font-semibold">Score</th>
              <th className="py-2 font-semibold">Alerts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-ink-muted">
                  {patients.length === 0
                    ? "No patients on this caseload yet."
                    : "No patients match your search."}
                </td>
              </tr>
            ) : (
              sorted.map((p) => (
              <tr key={p.id} className="border-b border-line transition-colors last:border-0 hover:bg-canvas/70">
                <td className="py-3">
                  <Link href={`/provider/patients/${p.id}`} className="flex items-center gap-3 font-semibold text-navy">
                    <Avatar name={p.name} size="sm" />
                    <span>
                      {p.name}
                      <span className="block text-caption font-normal text-ink-muted">{p.email}</span>
                    </span>
                  </Link>
                </td>
                <td>
                  <StatusBadge value={p.risk} />
                </td>
                <td>{p.risk === "UNASSESSED" ? "—" : `${Math.round(p.score * 100)}%`}</td>
                <td>{p.alerts}</td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
