import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { getResource } from "@/lib/resources";
import { getRelationOptions, listRecords } from "@/lib/crud";
import { Pagination } from "@/components/ui/Pagination";
import { ResourceView } from "@/components/crud/ResourceView";

export default async function ResourcePage({
  params, searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { resource } = await params;
  const { q, page } = await searchParams;
  const r = getResource(resource);
  if (!r) notFound();

  const session = await auth();
  const role = session?.user.role;
  if (!can(role, "data:read")) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Vous n&apos;avez pas l&apos;autorisation de consulter cette page.
      </div>
    );
  }

  const current = Math.max(1, Number(page) || 1);
  const [{ items, total, pages }, relations] = await Promise.all([
    listRecords(r, { q, page: current }),
    getRelationOptions(r),
  ]);

  return (
    <>
      <ResourceView
        res={{ key: r.key, icon: r.icon, singular: r.singular, plural: r.plural, fields: r.fields, deleteWarning: r.deleteWarning }}
        rows={items}
        total={total}
        relations={relations}
        canWrite={can(role, "data:write")}
        canDelete={can(role, "data:delete")}
      />
      <Pagination page={current} pages={pages} basePath={`/${r.key}`} q={q} />
    </>
  );
}
