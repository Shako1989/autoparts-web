import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trash2, Crosshair } from 'lucide-react';
import { clsx } from 'clsx';

import {
  useAdminCategories,
  useAdminDiagram,
  useAdminDiagrams,
  useAdminPart,
  useAddCallout,
  useAddFitments,
  useAddPartNumber,
  useCreatePart,
  useRemoveCallout,
  useRemoveFitment,
  useRemovePartNumber,
  useUpdatePart,
  type AdminPartCalloutLocation,
  type PartNumberType,
} from '@/api/admin';
import type { FitmentInput } from '@/api/listings';
import { LocalizedTextInput } from '@/components/admin/LocalizedTextInput';
import { FitmentPicker } from '@/components/seller/FitmentPicker';
import { DiagramCanvas } from '@/components/admin/DiagramCanvas';

interface Props {
  mode: 'create' | 'edit';
}

type Tab = 'specs' | 'numbers' | 'fitments' | 'callouts';

export default function PartEditorPage({ mode }: Props): ReactElement {
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === 'edit';
  const [tab, setTab] = useState<Tab>('specs');

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <Link to="/admin/parts" className="text-xs text-slate-500 hover:underline">← Parts</Link>
      <h1 className="text-2xl font-semibold">{isEdit ? 'Edit part' : 'New part'}</h1>

      {isEdit && (
        <div className="mt-6 flex gap-2 border-b border-slate-200">
          <TabButton active={tab === 'specs'} onClick={() => setTab('specs')} label="Specs" />
          <TabButton active={tab === 'numbers'} onClick={() => setTab('numbers')} label="Part numbers" />
          <TabButton active={tab === 'fitments'} onClick={() => setTab('fitments')} label="Fitments" />
          <TabButton active={tab === 'callouts'} onClick={() => setTab('callouts')} label="Callouts" />
        </div>
      )}

      <div className="mt-6">
        {(!isEdit || tab === 'specs') && <SpecsTab mode={mode} id={id} />}
        {isEdit && tab === 'numbers' && id && <NumbersTab partId={id} />}
        {isEdit && tab === 'fitments' && id && <FitmentsTab partId={id} />}
        {isEdit && tab === 'callouts' && id && <CalloutsTab partId={id} />}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        '-mb-px border-b-2 px-3 py-2 text-sm font-medium',
        active ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700',
      )}
    >
      {label}
    </button>
  );
}

function SpecsTab({ mode, id }: { mode: 'create' | 'edit'; id: string | undefined }): ReactElement {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const categoriesQ = useAdminCategories();
  const partQ = useAdminPart(isEdit ? id : undefined);
  const create = useCreatePart();
  const update = useUpdatePart(id ?? '');

  const [categoryId, setCategoryId] = useState('');
  const [names, setNames] = useState({ az: '', ru: '', en: '' });
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (partQ.data) {
      setCategoryId(partQ.data.categoryId);
      setNames({ az: partQ.data.nameAz, ru: partQ.data.nameRu, en: partQ.data.nameEn });
      setBrand(partQ.data.brand ?? '');
      setDescription(partQ.data.description ?? '');
    }
  }, [partQ.data]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError(null);
    try {
      if (isEdit && id) {
        await update.mutateAsync({
          categoryId: categoryId || undefined,
          nameAz: names.az,
          nameRu: names.ru,
          nameEn: names.en,
          brand,
          description,
        });
      } else {
        const created = await create.mutateAsync({
          categoryId,
          nameAz: names.az,
          nameRu: names.ru,
          nameEn: names.en,
          brand: brand || undefined,
          description: description || undefined,
        });
        navigate(`/admin/parts/${created.id}`, { replace: true });
        return;
      }
    } catch (err) {
      setSubmitError(extractError(err));
    }
  }

  if (isEdit && partQ.isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (isEdit && partQ.isError) return <p className="text-sm text-red-700">Part not found.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <LocalizedTextInput label="Name" values={names} onChange={setNames} required maxLength={255} />

      <div>
        <label className="block text-sm font-medium text-slate-700">Manufacturer (brand)</label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Bosch, BMW, Mahle, …"
          maxLength={120}
          className="mt-1 block w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">Who manufactures the part (not the car).</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={4000}
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={create.isPending || update.isPending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isEdit ? 'Save changes' : 'Create part'}
      </button>
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
    </form>
  );
}

function NumbersTab({ partId }: { partId: string }): ReactElement {
  const partQ = useAdminPart(partId);
  const add = useAddPartNumber(partId);
  const remove = useRemovePartNumber(partId);

  const [number, setNumber] = useState('');
  const [type, setType] = useState<PartNumberType>('OEM');
  const [source, setSource] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    try {
      await add.mutateAsync({ number: number.trim(), type, source: source.trim() || undefined });
      setNumber('');
      setSource('');
    } catch (err) {
      setError(extractError(err));
    }
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {(partQ.data?.partNumbers ?? []).map((pn) => (
          <li
            key={pn.id}
            className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600">{pn.type}</span>
            <span className="font-mono text-sm text-slate-900">{pn.number}</span>
            {pn.source && <span className="text-xs text-slate-500">{pn.source}</span>}
            <button
              type="button"
              onClick={() => remove.mutate(pn.id)}
              className="ml-auto rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
        {partQ.data && partQ.data.partNumbers.length === 0 && (
          <li className="text-sm text-slate-500">No part numbers yet.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_1fr_auto]">
        <input
          type="text"
          required
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Part number, e.g. 34116855152"
          maxLength={80}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PartNumberType)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="OEM">OEM</option>
          <option value="AFTERMARKET">Aftermarket</option>
        </select>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Source (BMW, Bosch, Mahle…)"
          maxLength={80}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={add.isPending}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function FitmentsTab({ partId }: { partId: string }): ReactElement {
  const partQ = useAdminPart(partId);
  const add = useAddFitments(partId);
  const remove = useRemoveFitment(partId);

  const [pending, setPending] = useState<(FitmentInput & { label: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function flush(): Promise<void> {
    if (pending.length === 0) return;
    setError(null);
    try {
      await add.mutateAsync(pending.map(({ makeSlug, modelSlug, year }) => ({ makeSlug, modelSlug, year })));
      setPending([]);
    } catch (err) {
      setError(extractError(err));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-700">Current fitments</h2>
        <ul className="mt-2 space-y-2">
          {(partQ.data?.fitments ?? []).map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-900">{f.makeName} {f.modelName} {f.year}</span>
              {f.trim && <span className="text-xs text-slate-500">{f.trim}</span>}
              {f.engineCode && <span className="text-xs text-slate-500">{f.engineCode}</span>}
              <button
                type="button"
                onClick={() => remove.mutate(f.id)}
                className="ml-auto rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
          {partQ.data && partQ.data.fitments.length === 0 && (
            <li className="text-sm text-slate-500">No fitments yet.</li>
          )}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700">Add fitments</h2>
        <div className="mt-2">
          <FitmentPicker value={pending} onChange={setPending} />
        </div>
        {pending.length > 0 && (
          <button
            type="button"
            onClick={flush}
            disabled={add.isPending}
            className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Save {pending.length} fitment{pending.length === 1 ? '' : 's'}
          </button>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function CalloutsTab({ partId }: { partId: string }): ReactElement {
  const partQ = useAdminPart(partId);
  const locations = partQ.data?.calloutLocations ?? [];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-700">Appears on these diagrams</h2>
        {locations.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            This part isn't on any diagram yet. Add it below.
          </p>
        ) : (
          <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {locations.map((loc) => (
              <li key={loc.calloutId}>
                <CalloutLocationCard partId={partId} loc={loc} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddToDiagramPanel
        partId={partId}
        partName={partQ.data?.nameEn ?? ''}
        existing={locations}
      />
    </div>
  );
}

function CalloutLocationCard({
  partId,
  loc,
}: {
  partId: string;
  loc: AdminPartCalloutLocation;
}): ReactElement {
  const remove = useRemoveCallout(loc.diagramId);

  async function handleRemove(): Promise<void> {
    if (!confirm(`Remove this part from "${loc.diagramTitleEn}"?`)) return;
    try {
      await remove.mutateAsync(loc.calloutId);
    } catch (err) {
      alert(extractError(err));
    }
  }

  // Position the marker proportionally on the rendered preview.
  const left = (loc.x / loc.diagramImageWidth) * 100;
  const top = (loc.y / loc.diagramImageHeight) * 100;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div
        className="relative w-full bg-slate-100"
        style={{ aspectRatio: `${loc.diagramImageWidth} / ${loc.diagramImageHeight}` }}
      >
        <img src={loc.diagramImageUrl} alt="" className="absolute inset-0 h-full w-full object-contain" />
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-700 bg-amber-400 px-2 py-0.5 text-xs font-semibold text-slate-900"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          {loc.label}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-3 text-sm">
        <div className="min-w-0 flex-1">
          <Link
            to={`/admin/diagrams/${loc.diagramId}`}
            className="block truncate font-medium text-slate-900 hover:underline"
          >
            {loc.diagramTitleEn}
          </Link>
          <div className="text-xs text-slate-500">callout "{loc.label}" at ({loc.x}, {loc.y})</div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <input type="hidden" value={partId} readOnly />
    </div>
  );
}

function AddToDiagramPanel({
  partId,
  partName,
  existing,
}: {
  partId: string;
  partName: string;
  existing: AdminPartCalloutLocation[];
}): ReactElement {
  const diagramsQ = useAdminDiagrams();
  const [selectedDiagramId, setSelectedDiagramId] = useState('');
  const diagramQ = useAdminDiagram(selectedDiagramId || undefined);
  const addCallout = useAddCallout(selectedDiagramId);

  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter out diagrams where this part is already placed.
  const usedDiagramIds = new Set(existing.map((l) => l.diagramId));
  const availableDiagrams = (diagramsQ.data ?? []).filter((d) => !usedDiagramIds.has(d.id));

  function suggestNextLabel(): string {
    const all = diagramQ.data?.callouts ?? [];
    const numeric = all
      .map((c) => Number(c.label))
      .filter((n) => Number.isFinite(n) && Number.isInteger(n) && n > 0);
    return String((numeric.length === 0 ? 0 : Math.max(...numeric)) + 1);
  }

  function handleAdd(x: number, y: number): void {
    setPending({ x, y });
    if (!label.trim()) setLabel(suggestNextLabel());
  }

  async function commit(): Promise<void> {
    setError(null);
    if (!selectedDiagramId) { setError('Pick a diagram first'); return; }
    if (!pending) { setError('Click on the diagram to set the position'); return; }
    if (!label.trim()) { setError('Label is required'); return; }
    try {
      await addCallout.mutateAsync({
        partId,
        label: label.trim(),
        x: pending.x,
        y: pending.y,
      });
      setPending(null);
      setLabel('');
      setSelectedDiagramId('');
    } catch (err) {
      setError(extractError(err));
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-700">Add this part to another diagram</h2>
      <p className="mt-1 text-xs text-slate-500">
        Pick a diagram and click on the image to place a callout for <span className="font-medium">{partName}</span>.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <label className="block text-xs font-medium text-slate-700">Diagram</label>
          <select
            value={selectedDiagramId}
            onChange={(e) => { setSelectedDiagramId(e.target.value); setPending(null); setLabel(''); }}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">(select)</option>
            {availableDiagrams.map((d) => (
              <option key={d.id} value={d.id}>
                {d.titleEn} {d.categorySlug ? `· ${d.categorySlug}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={20}
            placeholder="e.g. 5"
            className="mt-1 block w-24 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={commit}
          disabled={!pending || !selectedDiagramId || !label.trim() || addCallout.isPending}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Add callout
        </button>
      </div>

      {selectedDiagramId && diagramQ.data && (
        <div className="mt-4">
          <p className="mb-1 inline-flex items-center gap-1 text-xs text-amber-700">
            <Crosshair className="h-3 w-3" aria-hidden />
            {pending
              ? `Marker placed at (${pending.x}, ${pending.y}). Click again to move.`
              : 'Click on the image to place the marker.'}
          </p>
          <DiagramCanvas
            imageUrl={diagramQ.data.imageUrl}
            imageWidth={diagramQ.data.imageWidth}
            imageHeight={diagramQ.data.imageHeight}
            callouts={pending
              ? [
                  ...diagramQ.data.callouts,
                  {
                    id: '__pending',
                    label: label || '?',
                    x: pending.x,
                    y: pending.y,
                    w: null,
                    h: null,
                    zOrder: 999,
                    notes: null,
                    partId,
                    partName,
                  },
                ]
              : diagramQ.data.callouts}
            selectedCalloutId="__pending"
            addMode
            onAddAt={handleAdd}
            onSelect={() => { /* read-only here */ }}
          />
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {availableDiagrams.length === 0 && diagramsQ.data && diagramsQ.data.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          This part is already on every diagram in the catalog.
        </p>
      )}
      {diagramsQ.data && diagramsQ.data.length === 0 && (
        <p className="mt-2 text-xs text-slate-500">
          No diagrams in the catalog yet — create one from{' '}
          <Link to="/admin/diagrams/new" className="underline">Diagrams admin</Link>.
        </p>
      )}
    </section>
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
