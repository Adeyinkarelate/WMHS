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
  const keys = notice
    ?.split(",")
    .map((item) => item.trim())
    .filter((key): key is keyof typeof COPY => Boolean(COPY[key]));
  if (!keys?.length) return null;
  return (
    <div className="mb-6 space-y-2">
      {keys.map((key) => {
        const item = COPY[key];
        const classes =
          item.tone === "success"
            ? "bg-success-soft text-success-ink"
            : "bg-warning-soft text-warning-ink";
        return (
          <p key={key} className={`rounded-xl px-3 py-2 text-sm ${classes}`} role="alert">
            {item.text}
          </p>
        );
      })}
    </div>
  );
}
