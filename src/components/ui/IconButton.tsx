import { cn } from "@/lib/cn";

type Tone = "view" | "edit" | "delete" | "neutral";

const tones: Record<Tone, string> = {
  view: "text-sky-600 hover:bg-sky-50 hover:text-sky-700",
  edit: "text-amber-600 hover:bg-amber-50 hover:text-amber-700",
  delete: "text-red-500 hover:bg-red-50 hover:text-red-600",
  neutral: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
};

export function IconButton({
  tone = "neutral", label, className, children, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 disabled:opacity-40",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
