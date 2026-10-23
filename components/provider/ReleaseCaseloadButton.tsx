"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ReleaseCaseloadButton({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function release() {
    const ok = window.confirm(
      `Release ${patientName} from your named caseload? She returns to the facility waiting list.`
    );
    if (!ok) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/assignments/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not release this mother.");
        return;
      }
      router.push("/provider/patients");
      router.refresh();
    } catch {
      setError("Could not release this mother.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" loading={loading} onClick={release}>
        Release from caseload
      </Button>
      {error && (
        <p className="text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
