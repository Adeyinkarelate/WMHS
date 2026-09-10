"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_TYPES } from "@/types";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { todayInputDate } from "@/lib/utils/formatters";

const ACCEPT = ".pdf,.jpg,.jpeg,.png";
const MAX_BYTES = 8 * 1024 * 1024;

function isLabFile(file: File) {
  return /pdf|jpe?g|png/i.test(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name);
}

export function TestUpload() {
  const router = useRouter();
  const [testType, setTestType] = useState<string>(TEST_TYPES[0].value);
  const unit = useMemo(
    () => TEST_TYPES.find((t) => t.value === testType)?.unit ?? "",
    [testType]
  );
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  function takeFile(next: File | undefined) {
    if (!next) {
      setFile(null);
      return;
    }
    if (!isLabFile(next)) {
      setError("Upload a PDF, JPG, or PNG");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("Files must be 8 MB or smaller");
      return;
    }
    setError("");
    setFile(next);
  }

  async function uploadFile(): Promise<{ url: string; publicId: string; fileName: string } | null> {
    if (!file) return null;
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Could not upload the lab file");
    }
    return data as { url: string; publicId: string; fileName: string };
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      let uploaded: { url: string; publicId: string; fileName: string } | null = null;
      let fileSkipped = false;
      try {
        uploaded = await uploadFile();
      } catch {
        if (file) fileSkipped = true;
      }
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType,
          resultValue: form.get("resultValue"),
          resultUnit: unit,
          testDate: form.get("testDate"),
          notes: form.get("notes"),
          fileReference: uploaded?.fileName ?? (fileSkipped ? undefined : file?.name),
          fileUrl: uploaded?.url,
          filePublicId: uploaded?.publicId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save test");
        return;
      }
      if (data.warning || !data.assessment) {
        router.push("/patient/tests?notice=risk-pending");
      } else if (fileSkipped) {
        router.push("/patient/tests?notice=file-skipped");
      } else {
        router.push("/patient/risk-results");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save test");
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
      <Select
        label="Test type"
        name="testType"
        value={testType}
        onChange={(e) => setTestType(e.target.value)}
        options={TEST_TYPES.map((t) => ({ value: t.value, label: t.value }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="resultValue" type="number" step="0.1" label="Result value" required />
        <Input label="Unit" value={unit} readOnly />
      </div>
      <Input
        name="testDate"
        type="date"
        label="Test date"
        required
        defaultValue={todayInputDate()}
      />
      <div
        className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm ${
          drag ? "border-primary bg-primary-soft" : "border-line bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          takeFile(e.dataTransfer.files[0]);
        }}
      >
        <label htmlFor="lab-file" className="block cursor-pointer">
          <p className="font-semibold text-navy">Drop a lab file (PDF, JPG, PNG)</p>
          <p className="mt-1 text-ink-muted">Optional — stored on Cloudinary and attached to this result</p>
        </label>
        <input
          id="lab-file"
          className="mt-3"
          type="file"
          accept={ACCEPT}
          aria-label="Upload lab file (PDF, JPG, or PNG)"
          onChange={(e) => takeFile(e.target.files?.[0])}
        />
        {file && (
          <p className="mt-2 text-caption text-primary">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </p>
        )}
      </div>
      <Textarea name="notes" label="Notes" />
      <Button type="submit" loading={loading}>
        Save and assess risk
      </Button>
    </form>
  );
}
