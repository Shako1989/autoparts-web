import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  type AdminCategory,
} from '@/api/admin';
import { LocalizedTextInput } from '@/components/admin/LocalizedTextInput';

interface Props {
  mode: 'create' | 'edit';
}

export default function CategoryEditorPage({ mode }: Props): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === 'edit';

  const allQ = useAdminCategories();
  const existing = useMemo<AdminCategory | undefined>(
    () => (isEdit && id ? allQ.data?.find((c) => c.id === id) : undefined),
    [allQ.data, isEdit, id],
  );

  const create = useCreateCategory();
  const update = useUpdateCategory(id ?? '');

  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [names, setNames] = useState({ az: '', ru: '', en: '' });
  const [iconUrl, setIconUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setSlug(existing.slug);
      setParentId(existing.parentId ?? '');
      setNames({ az: existing.nameAz, ru: existing.nameRu, en: existing.nameEn });
      setIconUrl(existing.iconUrl ?? '');
      setSortOrder(existing.sortOrder);
    }
  }, [existing]);

  function autoSlug(): void {
    if (slug.trim().length > 0) return;
    const seed = (names.en || names.ru || names.az || '').toLowerCase();
    const suggested = seed
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
    if (suggested) setSlug(suggested);
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError(null);
    try {
      if (isEdit && id) {
        await update.mutateAsync({
          nameAz: names.az,
          nameRu: names.ru,
          nameEn: names.en,
          iconUrl: iconUrl || null,
          parentId: parentId || null,
          sortOrder,
        });
      } else {
        await create.mutateAsync({
          slug: slug.trim(),
          parentId: parentId || null,
          nameAz: names.az,
          nameRu: names.ru,
          nameEn: names.en,
          iconUrl: iconUrl || null,
          sortOrder,
        });
      }
      navigate('/admin/categories');
    } catch (err) {
      setSubmitError(extractError(err));
    }
  }

  if (isEdit && allQ.isLoading) {
    return <main className="container mx-auto px-4 py-10 text-sm text-slate-500">Loading…</main>;
  }
  if (isEdit && !existing) {
    return <main className="container mx-auto px-4 py-10 text-sm text-red-700">Category not found.</main>;
  }

  const allCategories = allQ.data ?? [];

  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <Link to="/admin/categories" className="text-xs text-slate-500 hover:underline">← Categories</Link>
      <h1 className="text-2xl font-semibold">{isEdit ? 'Edit category' : 'New category'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <LocalizedTextInput
          label="Name"
          values={names}
          onChange={setNames}
          required
          maxLength={160}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Slug <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isEdit}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            onBlur={autoSlug}
            placeholder="brakes"
            maxLength={120}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
          />
          {!isEdit && (
            <p className="mt-1 text-xs text-slate-500">
              Lowercase ASCII letters, digits, and hyphens. Filled in from the English name when you leave this field blank.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Parent</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">(root)</option>
            {allCategories
              .filter((c) => !isEdit || c.id !== id)
              .map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Sort order</label>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Math.max(0, Number(e.target.value)))}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Icon URL</label>
            <input
              type="text"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="http://localhost:9000/…/icon.png"
              maxLength={255}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={create.isPending || update.isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isEdit ? 'Save changes' : 'Create category'}
        </button>
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      </form>
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
