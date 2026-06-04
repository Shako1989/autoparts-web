import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import { useAdminCategories, useAdminParts, useDeletePart, type AdminPartListItem } from '@/api/admin';

export default function PartListPage(): ReactElement {
  const [categoryId, setCategoryId] = useState<string>('');
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const categoriesQ = useAdminCategories();
  const partsQ = useAdminParts({ categoryId: categoryId || undefined, q: debounced }, page, 20);
  const deletePart = useDeletePart();

  async function handleDelete(p: AdminPartListItem): Promise<void> {
    if (!confirm(`Delete part "${p.nameEn}"?`)) return;
    try {
      await deletePart.mutateAsync(p.id);
    } catch (err) {
      alert(extractError(err));
    }
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="text-xs text-slate-500 hover:underline">← Admin</Link>
          <h1 className="text-2xl font-semibold">Parts</h1>
        </div>
        <Link
          to="/admin/parts/new"
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> New part
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Search by name or brand"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none sm:col-span-2"
        />
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">All categories</option>
          {(categoriesQ.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.nameEn}</option>
          ))}
        </select>
      </div>

      <section className="mt-6">
        {partsQ.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {partsQ.data && partsQ.data.items.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            No parts found.
          </p>
        )}
        {partsQ.data && partsQ.data.items.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Name (EN)</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Brand</th>
                  <th className="px-4 py-2 text-left">Fits</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partsQ.data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-900">{p.nameEn}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{p.categorySlug}</td>
                    <td className="px-4 py-2 text-slate-500">{p.brand ?? '—'}</td>
                    <td className="px-4 py-2">
                      {p.fits.length === 0 ? (
                        <span className="text-xs text-slate-400">no fitments</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {p.fits.map((f) => (
                            <span
                              key={f}
                              className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                            >
                              {f}
                            </span>
                          ))}
                          {p.fitsTotal > p.fits.length && (
                            <span className="text-xs text-slate-500">
                              + {p.fitsTotal - p.fits.length} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex gap-1">
                        <Link
                          to={`/admin/parts/${p.id}`}
                          className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
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
            <Pagination page={page} total={partsQ.data.total} size={partsQ.data.size} onChange={setPage} />
          </div>
        )}
      </section>
    </main>
  );
}

function Pagination({
  page,
  total,
  size,
  onChange,
}: {
  page: number;
  total: number;
  size: number;
  onChange: (p: number) => void;
}): ReactElement {
  const last = Math.max(0, Math.ceil(total / size) - 1);
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
      <span>{total} parts</span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onChange(page - 1)}
          className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="px-2 py-1">Page {page + 1} / {last + 1}</span>
        <button
          type="button"
          disabled={page >= last}
          onClick={() => onChange(page + 1)}
          className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
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
