import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trash2, Crosshair, X } from 'lucide-react';
import { clsx } from 'clsx';

import {
  useAddCallout,
  useAdminCategories,
  useAdminDiagram,
  useCreateDiagram,
  useCreatePart,
  useRemoveCallout,
  useUpdateCallout,
  useUpdateDiagram,
  type AdminCalloutEntry,
} from '@/api/admin';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { LocalizedTextInput } from '@/components/admin/LocalizedTextInput';
import { DiagramCanvas } from '@/components/admin/DiagramCanvas';
import { PartPicker } from '@/components/seller/PartPicker';
import type { SearchHit } from '@/api/search';

interface Props {
  mode: 'create' | 'edit';
}

export default function DiagramEditorPage({ mode }: Props): ReactElement {
  return mode === 'create' ? <CreateView /> : <EditView />;
}

function CreateView(): ReactElement {
  const navigate = useNavigate();
  const categoriesQ = useAdminCategories();
  const create = useCreateDiagram();

  const [slug, setSlug] = useState('');
  const [titles, setTitles] = useState({ az: '', ru: '', en: '' });
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [dimError, setDimError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setDimensions(null);
    setDimError(null);
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setDimError('Failed to load image dimensions');
    img.src = imageUrl;
  }, [imageUrl]);

  function autoSlug(): void {
    if (slug.trim().length > 0) return;
    const seed = (titles.en || titles.ru || titles.az || '').toLowerCase();
    const suggested = seed.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 160);
    if (suggested) setSlug(suggested);
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError(null);
    if (!imageUrl) {
      setSubmitError('Upload an image first');
      return;
    }
    if (!dimensions) {
      setSubmitError('Waiting for image dimensions…');
      return;
    }
    if (!categoryId) {
      setSubmitError('Pick a category');
      return;
    }
    try {
      const created = await create.mutateAsync({
        slug: slug.trim(),
        titleAz: titles.az,
        titleRu: titles.ru,
        titleEn: titles.en,
        imageUrl,
        imageWidth: dimensions.w,
        imageHeight: dimensions.h,
        categoryId,
      });
      navigate(`/admin/diagrams/${created.id}`, { replace: true });
    } catch (err) {
      setSubmitError(extractError(err));
    }
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <Link to="/admin/diagrams" className="text-xs text-slate-500 hover:underline">← Diagrams</Link>
      <h1 className="text-2xl font-semibold">New diagram</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <LocalizedTextInput label="Title" values={titles} onChange={setTitles} required maxLength={255} />

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Slug <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            onBlur={autoSlug}
            placeholder="bmw-3-2016-engine"
            maxLength={160}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Category <span className="text-red-600">*</span>
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">(select category)</option>
            {(categoriesQ.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.nameEn}</option>
            ))}
          </select>
        </div>

        <ImageUploader
          label="Diagram image"
          value={imageUrl}
          onChange={setImageUrl}
          hint="Upload a JPG/PNG. Image dimensions are detected automatically."
        />
        {dimensions && (
          <p className="text-xs text-slate-500">Detected dimensions: {dimensions.w} × {dimensions.h}</p>
        )}
        {dimError && <p className="text-xs text-red-600">{dimError}</p>}

        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Create diagram
        </button>
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      </form>
    </main>
  );
}

function EditView(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const diagramQ = useAdminDiagram(id);

  if (diagramQ.isLoading) {
    return <main className="container mx-auto px-4 py-10 text-sm text-slate-500">Loading…</main>;
  }
  if (diagramQ.isError || !diagramQ.data) {
    return <main className="container mx-auto px-4 py-10 text-sm text-red-700">Diagram not found.</main>;
  }

  return <EditViewLoaded diagramId={id!} initialDiagram={diagramQ.data} />;
}

function EditViewLoaded({
  diagramId,
  initialDiagram,
}: {
  diagramId: string;
  initialDiagram: NonNullable<ReturnType<typeof useAdminDiagram>['data']>;
}): ReactElement {
  const categoriesQ = useAdminCategories();
  const updateDiagram = useUpdateDiagram(diagramId);
  const addCallout = useAddCallout(diagramId);
  const updateCallout = useUpdateCallout(diagramId);
  const removeCallout = useRemoveCallout(diagramId);

  const diagram = initialDiagram;
  const [titles, setTitles] = useState({
    az: diagram.titleAz, ru: diagram.titleRu, en: diagram.titleEn,
  });
  const [categoryId, setCategoryId] = useState(diagram.categoryId ?? '');
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);

  const sortedCallouts = useMemo(
    () =>
      [...diagram.callouts].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true }),
      ),
    [diagram.callouts],
  );
  const selected = sortedCallouts.find((c) => c.id === selectedId) ?? null;

  async function handleSaveMeta(): Promise<void> {
    setMetaError(null);
    setSavingMeta(true);
    try {
      await updateDiagram.mutateAsync({
        titleAz: titles.az,
        titleRu: titles.ru,
        titleEn: titles.en,
        categoryId: categoryId || null,
      });
    } catch (err) {
      setMetaError(extractError(err));
    } finally {
      setSavingMeta(false);
    }
  }

  function nextLabel(): string {
    const numeric = sortedCallouts
      .map((c) => Number(c.label))
      .filter((n) => Number.isFinite(n) && Number.isInteger(n) && n > 0);
    const max = numeric.length === 0 ? 0 : Math.max(...numeric);
    return String(max + 1);
  }

  function handleCanvasAdd(x: number, y: number): void {
    setPendingPosition({ x, y });
    setSelectedId(null);
  }

  async function commitPending(partId: string, label: string): Promise<void> {
    if (!pendingPosition) return;
    try {
      const created = await addCallout.mutateAsync({
        partId,
        label,
        x: pendingPosition.x,
        y: pendingPosition.y,
      });
      setPendingPosition(null);
      setAddMode(false);
      setSelectedId(created.id);
    } catch (err) {
      alert(extractError(err));
    }
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <Link to="/admin/diagrams" className="text-xs text-slate-500 hover:underline">← Diagrams</Link>
      <h1 className="text-2xl font-semibold">{diagram.titleEn}</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {diagram.imageWidth} × {diagram.imageHeight} · {sortedCallouts.length} callouts
            </p>
            <button
              type="button"
              onClick={() => {
                setAddMode((v) => !v);
                setPendingPosition(null);
                setSelectedId(null);
              }}
              className={clsx(
                'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium',
                addMode
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-slate-900 text-white hover:bg-slate-800',
              )}
            >
              <Crosshair className="h-4 w-4" aria-hidden />
              {addMode ? 'Click image to place…' : 'Add callout'}
            </button>
          </div>
          <DiagramCanvas
            imageUrl={diagram.imageUrl}
            imageWidth={diagram.imageWidth}
            imageHeight={diagram.imageHeight}
            callouts={sortedCallouts}
            selectedCalloutId={selected?.id ?? null}
            addMode={addMode && !pendingPosition}
            onAddAt={handleCanvasAdd}
            onSelect={(cid) => { setSelectedId(cid); setAddMode(false); setPendingPosition(null); }}
          />
        </section>

        <aside className="space-y-4">
          {pendingPosition && (
            <NewCalloutPanel
              x={pendingPosition.x}
              y={pendingPosition.y}
              suggestedLabel={nextLabel()}
              onCancel={() => setPendingPosition(null)}
              onCommit={commitPending}
            />
          )}

          {selected && (
            <CalloutEditorCard
              callout={selected}
              onSave={(body) => updateCallout.mutateAsync({ calloutId: selected.id, body })}
              onRemove={() => {
                if (!confirm('Remove this callout?')) return;
                removeCallout.mutate(selected.id);
                setSelectedId(null);
              }}
            />
          )}

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              Callouts
            </div>
            {sortedCallouts.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">No callouts yet.</p>
            ) : (
              <ul className="max-h-64 overflow-auto divide-y divide-slate-100">
                {sortedCallouts.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => { setSelectedId(c.id); setAddMode(false); setPendingPosition(null); }}
                      className={clsx(
                        'flex w-full items-center gap-3 px-4 py-2 text-left text-sm',
                        c.id === selected?.id ? 'bg-amber-50' : 'hover:bg-slate-50',
                      )}
                    >
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700">
                        {c.label}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-slate-800">{c.partName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-700">Diagram metadata</h2>
            <div className="mt-3 space-y-3">
              <LocalizedTextInput label="Title" values={titles} onChange={setTitles} maxLength={255} />
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="">(none)</option>
                  {(categoriesQ.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.nameEn}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleSaveMeta}
                disabled={savingMeta}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {savingMeta ? 'Saving…' : 'Save metadata'}
              </button>
              {metaError && <p className="text-xs text-red-600">{metaError}</p>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function NewCalloutPanel({
  x,
  y,
  suggestedLabel,
  onCancel,
  onCommit,
}: {
  x: number;
  y: number;
  suggestedLabel: string;
  onCancel: () => void;
  onCommit: (partId: string, label: string) => Promise<void>;
}): ReactElement {
  const [label, setLabel] = useState(suggestedLabel);
  const [mode, setMode] = useState<'pick' | 'create'>('pick');

  // Pick mode
  const [part, setPart] = useState<SearchHit | null>(null);

  // Create mode
  const categoriesQ = useAdminCategories();
  const createPart = useCreatePart();
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function commit(): Promise<void> {
    setError(null);
    if (!label.trim()) { setError('Label is required'); return; }
    setBusy(true);
    try {
      if (mode === 'pick') {
        if (!part) { setError('Pick a part first'); return; }
        await onCommit(part.partId, label.trim());
      } else {
        if (!newCategoryId) { setError('Pick a category'); return; }
        if (!newName.trim()) { setError('Name is required'); return; }
        const created = await createPart.mutateAsync({
          categoryId: newCategoryId,
          nameAz: newName.trim(),
          nameRu: newName.trim(),
          nameEn: newName.trim(),
          brand: newBrand.trim() || undefined,
        });
        await onCommit(created.id, label.trim());
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-amber-900">New callout</h2>
          <p className="text-xs text-amber-800">at ({x}, {y})</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded p-1 text-amber-900 hover:bg-amber-100"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-xs font-medium text-amber-900">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={20}
            className="mt-1 block w-24 rounded-md border border-amber-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div className="inline-flex rounded-md border border-amber-300 bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('pick')}
            className={clsx(
              'rounded px-2 py-0.5',
              mode === 'pick' ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-100',
            )}
          >
            Pick existing
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={clsx(
              'rounded px-2 py-0.5',
              mode === 'create' ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-100',
            )}
          >
            Create new
          </button>
        </div>

        {mode === 'pick' ? (
          <div>
            <label className="block text-xs font-medium text-amber-900">Part</label>
            <div className="mt-1">
              <PartPicker value={part} onChange={setPart} />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-amber-900">Category</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-amber-600 focus:outline-none"
              >
                <option value="">(select)</option>
                {(categoriesQ.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-900">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={255}
                placeholder="e.g. Wheel hub with bearing, front"
                className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-amber-600 focus:outline-none"
              />
              <p className="mt-0.5 text-[10px] text-amber-700">
                Used for all three locales. You can edit AZ/RU later in the Parts admin.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-900">Manufacturer (optional)</label>
              <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                maxLength={120}
                placeholder="BMW, Bosch, Mahle…"
                className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-700">{error}</p>}
        <button
          type="button"
          onClick={commit}
          disabled={busy}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : mode === 'create' ? 'Create part & add callout' : 'Add callout'}
        </button>
      </div>
    </div>
  );
}

function CalloutEditorCard({
  callout,
  onSave,
  onRemove,
}: {
  callout: AdminCalloutEntry;
  onSave: (body: { label?: string; x?: number; y?: number; notes?: string }) => Promise<unknown>;
  onRemove: () => void;
}): ReactElement {
  const [label, setLabel] = useState(callout.label);
  const [notes, setNotes] = useState(callout.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLabel(callout.label);
    setNotes(callout.notes ?? '');
  }, [callout.id, callout.label, callout.notes]);

  async function save(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await onSave({ label, notes });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Callout {callout.label}</h2>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">Linked part: <span className="text-slate-800">{callout.partName}</span></p>
      <p className="text-xs text-slate-500">Position: ({callout.x}, {callout.y})</p>
      <div className="mt-3 space-y-2">
        <div>
          <label className="block text-xs font-medium text-slate-700">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={20}
            className="mt-1 block w-24 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={255}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
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
