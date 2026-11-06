import { cn } from "@/lib/cn";
import { photoUrl } from "@/lib/photo";

export function Avatar({
  photo, sexe, id, alt = "", size = 36, className,
}: { photo?: string | null; sexe?: string | null; id?: number | null; alt?: string; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(photo, sexe, id)}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn(
        "shrink-0 rounded-full border-2 border-white bg-slate-100 object-cover shadow-sm ring-1 ring-slate-200/80",
        className,
      )}
    />
  );
}
