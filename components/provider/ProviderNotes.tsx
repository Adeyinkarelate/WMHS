"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils/formatters";

export type ClinicalNoteRow = {
  id: string;
  content: string;
  createdAt: string | Date;
  author: { name: string };
};

export function ProviderNotes({
  patientId,
  notes,
}: {
  patientId: string;
  notes: ClinicalNoteRow[];
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save note");
        return;
      }
      setValue("");
      router.refresh();
    } catch {
      setError("Could not save note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <p className="text-caption text-ink-muted">Clinical notes</p>
      <form className="mt-2 space-y-3" onSubmit={onSubmit}>
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Textarea
          name="notes"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          minLength={3}
          placeholder="Visible to assigned clinicians on this chart"
        />
        <Button size="sm" type="submit" loading={loading}>
          Save note
        </Button>
      </form>
      {notes.length > 0 && (
        <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto border-t border-line pt-3">
          {notes.map((note) => (
            <li key={note.id} className="text-sm">
              <p className="whitespace-pre-wrap text-ink">{note.content}</p>
              <p className="mt-1 text-caption text-ink-muted">
                {note.author.name} · {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
