const COPY: Record<string, { text: string; tone: "warning" | "success" }> = {
  "risk-pending": {
    text: "Saved, but risk could not be recalculated. Open Risk results and choose Recalculate now.",
    tone: "warning",
  },
  "file-skipped": {
    text: "Result saved without the lab file. File storage was unavailable — you can upload it again from Tests.",
    tone: "warning",
  },
};

export function QueryNotice({ notice }: { notice?: string }) {
  const item = notice ? COPY[notice] : undefined;
  if (!item) return null;
  const classes =
    item.tone === "success"
      ? "bg-success-soft text-success-ink"
      : "bg-warning-soft text-warning-ink";
  return (
    <p className={`mb-6 rounded-xl px-3 py-2 text-sm ${classes}`} role="alert">
      {item.text}
    </p>
  );
}
