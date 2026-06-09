import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import {
  useAdminCategories,
  useAdminDiagrams,
  useDeleteDiagram,
  type AdminDiagramListItem,
} from '@/api/admin';

export default function DiagramListPage(): ReactElement {
  const [categoryId, setCategoryId] = useState<string>('');
  const categoriesQ = useAdminCategories();
  const diagramsQ = useAdminDiagrams(categoryId || null);
  const deleteDiagram = useDeleteDiagram();

  async function handleDelete(d: AdminDiagramListItem): Promise<void> {
    if (!confirm(`Delete diagram "${d.titleEn}"? Callouts will be removed too.`)) return;
    try {
      await deleteDiagram.mutateAsync(d.id);
    } catch (err) {
      alert(extractError(err));
    }
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="text-xs text-slate-500 hover:underline">← Admin</Link>
          <h1 className="text-2xl font-semibold">Diagrams</h1>
        </div>
        <Link
          to="/admin/diagrams/new"
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> New diagram
        </Link>
      </div>

      <div className="mt-6">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">All categories</option>
          {(categoriesQ.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.nameEn}</option>
          ))}
        </select>
      </div>

      <section className="mt-6">
        {diagramsQ.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {diagramsQ.data && diagramsQ.data.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            No diagrams yet.
          </p>
        )}
        {diagramsQ.data && diagramsQ.data.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {diagramsQ.data.map((d) => (
              <li key={d.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="aspect-[4/3] w-full bg-slate-100">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">no image</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="truncate font-medium text-slate-900">{d.titleEn}</div>
                  <div className="mt-0.5 truncate font-mono text-xs text-slate-500">{d.slug}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{d.calloutCount} callouts</span>
                    <span>{d.categorySlug ?? '—'}</span>
                  </div>
                  <div className="mt-2 flex justify-end gap-1">
                    <Link
                      to={`/admin/diagrams/${d.id}`}
                      className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(d)}
                      className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function extractError(err: unknown): string {
  if (typeof err === 'object' && err && 'response' in err) {
    const r = (err as { response?: { data?: { detail?: string; title?: string } } }).response;
    if (r?.data?.detail) return r.data.detail;
    if (r?.data?.title) return r.data.title;
  }
  return 'Something went wrong';
}
