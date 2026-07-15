export function SwapCardSkeleton() {
  return (
    <div
      aria-hidden
      className="w-full max-w-[420px] animate-pulse rounded-3xl border border-border bg-surface/80 p-5 shadow-card backdrop-blur"
    >
      <div className="mb-6 h-7 w-32 rounded-lg bg-surface-muted" />
      <div className="space-y-3">
        <div className="h-28 rounded-2xl bg-surface-muted" />
        <div className="h-28 rounded-2xl bg-surface-muted" />
        <div className="h-12 rounded-xl bg-surface-muted" />
        <div className="h-12 rounded-xl bg-surface-muted" />
      </div>
    </div>
  );
}
