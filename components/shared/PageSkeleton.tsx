export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status">
      <span className="sr-only">Loading</span>
      <div className="animate-pulse space-y-4" aria-hidden>
        <div className="h-3 w-24 rounded-full bg-line" />
        <div className="h-8 w-64 max-w-full rounded-full bg-line" />
        <div className="h-4 w-full max-w-xl rounded-full bg-line/80" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-36 rounded-[1.75rem] bg-white shadow-card" />
          <div className="h-36 rounded-[1.75rem] bg-white shadow-card" />
          <div className="h-36 rounded-[1.75rem] bg-white shadow-card" />
        </div>
        <div className="h-64 rounded-[1.75rem] bg-white shadow-card" />
      </div>
    </div>
  );
}
