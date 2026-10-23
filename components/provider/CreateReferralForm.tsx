"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function CreateReferralForm({
  patientId,
  facilities,
}: {
  patientId: string;
  facilities: Array<{ id: string; name: string; address: string; emergencyAvailable: boolean }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setOk(false);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          facilityId: form.get("facilityId"),
          reason: form.get("reason"),
          transportNotes: form.get("transportNotes"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(typeof data.error === "string" ? data.error : "Could not create referral.");
        return;
      }
      formEl.reset();
      setOk(true);
      setMsg("Referral sent to the mother and this chart.");
      router.refresh();
    } catch {
      setMsg("Could not create referral.");
    } finally {
      setBusy(false);
    }
  }

  if (facilities.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No facilities are on record, so a referral cannot be created yet.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Select
        name="facilityId"
        label="Receiving facility"
        required
        placeholder="Select a facility"
        defaultValue=""
        options={facilities.map((f) => ({
          value: f.id,
          label: `${f.name}${f.emergencyAvailable ? " · Emergency" : ""}`,
        }))}
      />
      <Textarea
        name="reason"
        label="Clinical reason"
        required
        minLength={3}
        placeholder="Why she needs this facility now"
      />
      <Textarea name="transportNotes" label="Transport notes" placeholder="Ambulance, relative, or self" />
      {msg && (
        <p className={`text-sm ${ok ? "text-success-ink" : "text-danger-ink"}`} role={ok ? "status" : "alert"}>
          {msg}
        </p>
      )}
      <Button type="submit" loading={busy}>
        Create referral
      </Button>
    </form>
  );
}
