import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Pagination({
  page, pages, basePath, q,
}: { page: number; pages: number; basePath: string; q?: string }) {
  if (pages <= 1) return null;
  const href = (p: number) => `${basePath}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;
  const link =
    "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300";

  return (
    <nav className="mt-6 flex items-center justify-between">
      <span className="text-sm text-slate-500">
        Page <span className="font-medium text-slate-700">{page}</span> / {pages}
      </span>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          className={cn(link, page <= 1 && "pointer-events-none opacity-40")}
          href={href(page - 1)}
        >
          <ChevronLeft size={15} /> Précédent
        </Link>
        <Link
          aria-disabled={page >= pages}
          className={cn(link, page >= pages && "pointer-events-none opacity-40")}
          href={href(page + 1)}
        >
          Suivant <ChevronRight size={15} />
        </Link>
      </div>
    </nav>
  );
}
