"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function RecalculateRisk({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/risk/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientId ? { patientId } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not recalculate risk.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not recalculate risk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="no-print">
      <Button type="button" variant="outline" size="sm" loading={loading} onClick={run}>
        Recalculate now
      </Button>
      {error ? (
        <p className="mt-2 text-caption text-danger-ink" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
