"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SymptomForm } from "@/components/patient/SymptomForm";
import { TestUpload } from "@/components/patient/TestUpload";
import { Icons } from "@/components/shared/Icons";
import type { VisitSaveResult } from "@/types/visit";

export function VisitEntry({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<"symptom" | "test" | null>(null);
  const [notice, setNotice] = useState<VisitSaveResult | null>(null);

  function handleSaved(result?: VisitSaveResult) {
    setOpen(null);
    setNotice(result ?? { ok: "Saved to the chart." });
    window.setTimeout(() => router.refresh(), 250);
  }

  return (
    <>
      {notice?.warning && (
        <p className="mb-3 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning-ink" role="alert">
          {notice.warning}
        </p>
      )}
      {notice?.ok && !notice.warning && (
        <p className="mb-3 rounded-xl bg-success-soft px-3 py-2 text-sm text-success-ink" role="status">
          {notice.ok}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => setOpen("symptom")}>
          <Icons.pulse size={16} />
          Log symptom
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen("test")}>
          <Icons.flask size={16} />
          Enter vital or lab
        </Button>
      </div>
      <Modal open={open === "symptom"} onClose={() => setOpen(null)} title="Log a symptom">
        <p className="mb-4 text-sm text-ink-muted">
          Saves to this chart and recalculates risk. Use this during the visit if she cannot log from her phone.
        </p>
        <SymptomForm patientId={patientId} mode="clinician" onSaved={handleSaved} />
      </Modal>
      <Modal open={open === "test"} onClose={() => setOpen(null)} title="Enter a vital or lab">
        <p className="mb-4 text-sm text-ink-muted">
          Blood pressure, glucose, haemoglobin and files recorded here feed the same triage engine.
        </p>
        <TestUpload patientId={patientId} mode="clinician" onSaved={handleSaved} />
      </Modal>
    </>
  );
}
