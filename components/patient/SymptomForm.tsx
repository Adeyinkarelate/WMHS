"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SYMPTOM_TYPES } from "@/types";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { todayInputDate } from "@/lib/utils/formatters";

export function SymptomForm() {
  const router = useRouter();
  const [severity, setSeverity] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptomType: form.get("symptomType"),
          severity,
          notes: form.get("notes"),
          submissionDate: form.get("submissionDate"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save symptom");
        return;
      }
      if (data.warning || !data.assessment) {
        router.push("/patient/symptoms?notice=risk-pending");
      } else {
        router.push("/patient/risk-results");
      }
      router.refresh();
    } catch {
      setError("Could not save symptom");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}
      <Input
        name="submissionDate"
        type="date"
        label="Date"
        required
        defaultValue={todayInputDate()}
      />
      <Select
        name="symptomType"
        label="Symptom"
        required
        defaultValue={SYMPTOM_TYPES[0]}
        options={SYMPTOM_TYPES.map((s) => ({ value: s, label: s }))}
      />
      <Slider label="Severity" value={severity} onChange={setSeverity} />
      <Textarea name="notes" label="Notes" placeholder="Anything else your midwife should know" />
      <Button type="submit" loading={loading}>
        Save and assess risk
      </Button>
    </form>
  );
}
