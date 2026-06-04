import { useMemo, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';

import { useAdminCategories, useDeleteCategory, type AdminCategory } from '@/api/admin';

interface TreeNode extends AdminCategory {
  depth: number;
}

export default function CategoryListPage(): ReactElement {
  const { data, isLoading, isError } = useAdminCategories();
  const deleteCategory = useDeleteCategory();

  const flat = useMemo(() => (data ? toTree(data) : []), [data]);

  async function handleDelete(c: AdminCategory): Promise<void> {
    if (!confirm(`Delete category "${c.nameEn}"? This cannot be undone.`)) return;
    try {
      await deleteCategory.mutateAsync(c.id);
    } catch (err) {
      alert(extractError(err));
    }
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="text-xs text-slate-500 hover:underline">← Admin</Link>
          <h1 className="text-2xl font-semibold">Categories</h1>
        </div>
        <Link
          to="/admin/categories/new"
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> New category
        </Link>
      </div>

      {isLoading && <p className="mt-6 text-sm text-slate-500">Loading…</p>}
      {isError && <p className="mt-6 text-sm text-red-700">Failed to load categories.</p>}

      {flat.length === 0 && data && (
        <p className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          No categories yet. Create the first one.
        </p>
      )}

      {flat.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Name (EN)</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-right">Sort</th>
                <th className="px-4 py-2 text-right">Children</th>
                <th className="px-4 py-2 text-right">Parts</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flat.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <div className="flex items-center" style={{ paddingLeft: c.depth * 16 }}>
                      {c.depth > 0 && (
                        <ChevronRight className="mr-1 h-3 w-3 text-slate-400" aria-hidden />
                      )}
                      <span className="font-medium text-slate-900">{c.nameEn}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{c.slug}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{c.sortOrder}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{c.childCount}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{c.partCount}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Link
                        to={`/admin/categories/${c.id}`}
                        className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function toTree(all: AdminCategory[]): TreeNode[] {
  const byParent = new Map<string | null, AdminCategory[]>();
  for (const c of all) {
    const key = c.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  const out: TreeNode[] = [];
  function walk(parentId: string | null, depth: number): void {
    const nodes = byParent.get(parentId) ?? [];
    for (const n of nodes) {
      out.push({ ...n, depth });
      walk(n.id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
}

function extractError(err: unknown): string {
  if (typeof err === 'object' && err && 'response' in err) {
    const r = (err as { response?: { data?: { detail?: string; title?: string } } }).response;
    if (r?.data?.detail) return r.data.detail;
    if (r?.data?.title) return r.data.title;
  }
  return 'Something went wrong';
}
