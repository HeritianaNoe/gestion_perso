export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Chargement">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="h-3 w-72 rounded bg-slate-100" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="h-11 bg-slate-50" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-slate-100 px-5 py-4">
            <div className="h-8 w-8 rounded-full bg-slate-100" />
            <div className="h-3 w-1/4 rounded bg-slate-100" />
            <div className="h-3 w-1/6 rounded bg-slate-100" />
            <div className="h-3 w-1/5 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
