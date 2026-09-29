export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-sm text-neutral-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
      {label}
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-md bg-neutral-200" />
      <div className="mt-3 h-3 w-3/4 rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-1/3 rounded bg-neutral-200" />
    </div>
  );
}