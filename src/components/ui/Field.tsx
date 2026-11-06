import { cn } from "@/lib/cn";
import { AppIcon } from "@/components/ui/AppIcon";
import type { IconName } from "@/components/crud/types";

type Common = { label: string; name: string; error?: string[]; icon?: IconName };

export function Label({ icon, children }: { icon?: IconName; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
      <AppIcon name={icon} size={15} className="text-slate-400" />
      {children}
    </span>
  );
}

const base =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

export function Input({
  label, name, error, icon, className, ...props
}: Common & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <Label icon={icon}>{label}</Label>
      <input
        name={name}
        className={cn(base, error && "border-red-400 focus:border-red-400 focus:ring-red-500/10", className)}
        {...props}
      />
      {error?.map((e) => (
        <p key={e} className="text-xs text-red-600">
          {e}
        </p>
      ))}
    </label>
  );
}

export function Select({
  label, name, error, icon, options, placeholder, className, ...props
}: Common & {
  options: { value: string; label: string }[];
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block space-y-1.5">
      <Label icon={icon}>{label}</Label>
      <select
        name={name}
        className={cn(base, "bg-white", error && "border-red-400 focus:border-red-400 focus:ring-red-500/10", className)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error?.map((e) => (
        <p key={e} className="text-xs text-red-600">
          {e}
        </p>
      ))}
    </label>
  );
}

export function Textarea({
  label, name, error, icon, className, ...props
}: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-1.5">
      <Label icon={icon}>{label}</Label>
      <textarea
        name={name}
        rows={3}
        className={cn(base, "resize-y", error && "border-red-400 focus:border-red-400 focus:ring-red-500/10", className)}
        {...props}
      />
      {error?.map((e) => (
        <p key={e} className="text-xs text-red-600">
          {e}
        </p>
      ))}
    </label>
  );
}
