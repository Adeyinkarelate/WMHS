function isImageFile(fileUrl: string, fileName?: string | null) {
  const name = fileName || "";
  if (/\.(jpe?g|png|gif|webp)(\?|$)/i.test(name)) return true;
  if (/\.(jpe?g|png|gif|webp)(\?|$)/i.test(fileUrl)) return true;
  if (/\/image\/upload\//i.test(fileUrl) && !/\.pdf(\?|$)/i.test(name)) return true;
  return false;
}

export function LabFileLink({
  fileUrl,
  fileName,
}: {
  fileUrl?: string | null;
  fileName?: string | null;
}) {
  if (!fileUrl && !fileName) return null;
  const label = fileName || "Lab file";
  if (!fileUrl) {
    return <p className="mt-2 text-caption text-ink-muted">File: {label}</p>;
  }
  const image = isImageFile(fileUrl, fileName);
  return (
    <div className="mt-3">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fileUrl} alt={label} className="mb-2 max-h-40 rounded-xl border border-line object-cover" />
      ) : null}
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
      >
        Open {label}
      </a>
    </div>
  );
}
