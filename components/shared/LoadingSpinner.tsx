export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <span className="text-caption text-ink-muted">{label}</span>
    </div>
  );
}
