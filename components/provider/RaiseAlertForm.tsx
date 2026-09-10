"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ALERT_TYPE_LABELS } from "@/lib/alerts/labels";
import type { AlertSeverity, AlertType } from "@/types";

const types = (Object.keys(ALERT_TYPE_LABELS) as AlertType[]).map((value) => ({
  value,
  label: ALERT_TYPE_LABELS[value],
}));

const severities: Array<{ value: AlertSeverity; label: string }> = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export function RaiseAlertForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      const res = await fetch("/api/providers/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          alertType: form.get("alertType"),
          severity: form.get("severity"),
          notes: form.get("notes"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(typeof data.error === "string" ? data.error : "Could not raise alert.");
        return;
      }
      formEl.reset();
      setMsg("Alert sent to the patient and assigned clinicians.");
      router.refresh();
    } catch {
      setMsg("Could not raise alert.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Select name="alertType" label="Alert type" options={types} defaultValue="CLINICAL" required />
      <Select name="severity" label="Severity" options={severities} defaultValue="HIGH" required />
      <Textarea name="notes" label="Clinical note" required minLength={3} placeholder="What needs review, and by when?" />
      {msg && <p className="text-sm text-ink-muted">{msg}</p>}
      <Button type="submit" loading={busy}>
        Raise alert
      </Button>
    </form>
  );
}
