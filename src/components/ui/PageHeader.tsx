import { AppIcon } from "@/components/ui/AppIcon";
import type { IconName } from "@/components/crud/types";

export function PageHeader({
  title, description, actions, icon,
}: { title: string; description?: string; actions?: React.ReactNode; icon?: IconName }) {
  return (
    <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {icon && (
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100">
            <AppIcon name={icon} size={22} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}
