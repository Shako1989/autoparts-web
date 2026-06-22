import { useState, type ReactElement, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, MoveRight } from 'lucide-react';

import { useMakes, useModels, type VehicleMake, type VehicleModel } from '@/api/catalog';
import {
  useAdminGenerations,
  useCreateGeneration,
  useUpdateGeneration,
  useDeleteGeneration,
  useMoveVariants,
  useVariantsForGeneration,
  type AdminGeneration,
  type CreateGenerationRequest,
  type UpdateGenerationRequest,
  type VehicleVariantResponse,
} from '@/api/admin';

// ---------- helpers ----------

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const CURRENT_YEAR = new Date().getFullYear();
const MAX_YEAR = CURRENT_YEAR + 5;

function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string; detail?: string; title?: string } } }).response;
    if (r?.data?.message) return r.data.message;
    if (r?.data?.detail) return r.data.detail;
    if (r?.data?.title) return r.data.title;
  }
  return 'Something went wrong';
}

interface GenerationFormValues {
  name: string;
  slug: string;
  code: string;
  yearFrom: string;
  yearTo: string;
}

const emptyForm: GenerationFormValues = {
  name: '',
  slug: '',
  code: '',
  yearFrom: '',
  yearTo: '',
};

function genToForm(g: AdminGeneration): GenerationFormValues {
  return {
    name: g.name,
    slug: g.slug,
    code: g.code ?? '',
    yearFrom: String(g.yearFrom),
    yearTo: g.yearTo !== null ? String(g.yearTo) : '',
  };
}

interface ValidationErrors {
  name?: string;
  slug?: string;
  code?: string;
  yearFrom?: string;
  yearTo?: string;
}

type TranslateFn = ReturnType<typeof useTranslation>['t'];

function validateForm(
  values: GenerationFormValues,
  t: TranslateFn,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!values.name.trim()) {
    errors.name = t('admin.vehicles.validation.required');
  } else if (values.name.length > 120) {
    errors.name = t('admin.vehicles.validation.tooLong');
  }

  if (!values.slug.trim()) {
    errors.slug = t('admin.vehicles.validation.required');
  } else if (values.slug.length > 120) {
    errors.slug = t('admin.vehicles.validation.tooLong');
  } else if (!SLUG_RE.test(values.slug)) {
    errors.slug = t('admin.vehicles.validation.slugFormat');
  }

  if (values.code.length > 40) {
    errors.code = t('admin.vehicles.validation.tooLong');
  }

  const yf = parseInt(values.yearFrom, 10);
  if (!values.yearFrom || isNaN(yf)) {
    errors.yearFrom = t('admin.vehicles.validation.required');
  } else if (yf < 1900 || yf > MAX_YEAR) {
    errors.yearFrom = t('admin.vehicles.validation.yearRange', { max: MAX_YEAR });
  }

  if (values.yearTo) {
    const yt = parseInt(values.yearTo, 10);
    if (isNaN(yt)) {
      errors.yearTo = t('admin.vehicles.validation.invalidYear');
    } else if (yt < yf) {
      errors.yearTo = t('admin.vehicles.validation.yearToMin');
    }
  }

  return errors;
}

function formToCreateRequest(values: GenerationFormValues): CreateGenerationRequest {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    code: values.code.trim() || null,
    yearFrom: parseInt(values.yearFrom, 10),
    yearTo: values.yearTo ? parseInt(values.yearTo, 10) : null,
  };
}

function formToUpdateRequest(values: GenerationFormValues): UpdateGenerationRequest {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    code: values.code.trim() || null,
    yearFrom: parseInt(values.yearFrom, 10),
    yearTo: values.yearTo ? parseInt(values.yearTo, 10) : null,
  };
}

// ---------- GenerationForm (shared create / edit) ----------

interface GenerationFormProps {
  initial?: GenerationFormValues;
  onSubmit: (values: GenerationFormValues) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

function GenerationForm({
  initial = emptyForm,
  onSubmit,
  onCancel,
  submitting,
}: GenerationFormProps): ReactElement {
  const { t } = useTranslation();
  const [values, setValues] = useState<GenerationFormValues>(initial);
  const [errors, setErrors] = useState<ValidationErrors>({});

  function set(field: keyof GenerationFormValues, value: string): void {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    const errs = validateForm(values, t);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onSubmit(values);
  }

  const inputClass =
    'block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';
  const errorClass = 'mt-1 text-xs text-red-600';
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="col-span-2 sm:col-span-1">
        <label className={labelClass}>{t('admin.vehicles.cols.name')} *</label>
        <input
          className={inputClass}
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          maxLength={120}
          disabled={submitting}
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className={labelClass}>{t('admin.vehicles.cols.slug')} *</label>
        <input
          className={inputClass}
          value={values.slug}
          onChange={(e) => set('slug', e.target.value)}
          maxLength={120}
          disabled={submitting}
        />
        {errors.slug ? (
          <p className={errorClass}>{errors.slug}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-400">{t('admin.vehicles.fields.slugHint')}</p>
        )}
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className={labelClass}>{t('admin.vehicles.cols.code')}</label>
        <input
          className={inputClass}
          value={values.code}
          onChange={(e) => set('code', e.target.value)}
          maxLength={40}
          disabled={submitting}
          placeholder={t('admin.vehicles.fields.codeHint')}
        />
        {errors.code && <p className={errorClass}>{errors.code}</p>}
      </div>

      <div>
        <label className={labelClass}>Year from *</label>
        <input
          type="number"
          className={inputClass}
          value={values.yearFrom}
          onChange={(e) => set('yearFrom', e.target.value)}
          min={1900}
          max={MAX_YEAR}
          disabled={submitting}
        />
        {errors.yearFrom && <p className={errorClass}>{errors.yearFrom}</p>}
      </div>

      <div>
        <label className={labelClass}>{t('admin.vehicles.fields.yearTo')}</label>
        <input
          type="number"
          className={inputClass}
          value={values.yearTo}
          onChange={(e) => set('yearTo', e.target.value)}
          min={1900}
          max={MAX_YEAR}
          disabled={submitting}
          placeholder="—"
        />
        {errors.yearTo && <p className={errorClass}>{errors.yearTo}</p>}
      </div>

      <div className="col-span-2 sm:col-span-3 flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {t('admin.vehicles.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? t('catalog.loading') : t('admin.vehicles.save')}
        </button>
      </div>
    </form>
  );
}

// ---------- VariantsPanel ----------

interface VariantsPanelProps {
  generation: AdminGeneration;
  allGenerations: AdminGeneration[];
  modelId: string;
}

function VariantsPanel({ generation, allGenerations, modelId }: VariantsPanelProps): ReactElement {
  const { t } = useTranslation();
  const { data: variants, isLoading, isError } = useVariantsForGeneration(generation.id);
  const moveVariants = useMoveVariants();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetGenId, setTargetGenId] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  const otherGens = allGenerations.filter((g) => g.id !== generation.id);

  function toggleAll(checked: boolean): void {
    if (!variants) return;
    setSelected(checked ? new Set(variants.map((v) => v.id)) : new Set());
  }

  function toggle(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleMove(): Promise<void> {
    if (!targetGenId || selected.size === 0) return;
    try {
      const result = await moveVariants.mutateAsync({
        srcId: generation.id,
        modelId,
        body: { targetGenerationId: targetGenId, variantIds: Array.from(selected) },
      });
      setSelected(new Set());
      setNotice(t('admin.vehicles.movedNotice', { count: result.data.moved }));
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      alert(extractMessage(err));
    }
  }

  if (isLoading) {
    return <p className="px-4 py-3 text-sm text-slate-500">{t('catalog.loading')}</p>;
  }
  if (isError) {
    return <p className="px-4 py-3 text-sm text-red-600">Failed to load variants.</p>;
  }

  const rows: VehicleVariantResponse[] = variants ?? [];

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t('admin.vehicles.variantsHeader', { count: rows.length })}
      </p>

      {otherGens.length > 0 && (
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600">{t('admin.vehicles.moveTo')}:</span>
          <select
            className="rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            value={targetGenId}
            onChange={(e) => setTargetGenId(e.target.value)}
          >
            <option value="">— pick generation —</option>
            {otherGens.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleMove}
            disabled={selected.size === 0 || !targetGenId || moveVariants.isPending}
            className="inline-flex items-center gap-1 rounded bg-slate-700 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-40"
          >
            <MoveRight className="h-3 w-3" aria-hidden />
            {t('admin.vehicles.move')}
          </button>
          {notice && <span className="text-xs text-green-700">{notice}</span>}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-xs text-slate-400">No variants in this generation.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-1 pr-3 text-left">
                  <input
                    type="checkbox"
                    checked={rows.length > 0 && selected.size === rows.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                    aria-label="Select all"
                  />
                </th>
                <th className="pb-1 pr-3 text-left">Year</th>
                <th className="pb-1 pr-3 text-left">Trim</th>
                <th className="pb-1 pr-3 text-left">Engine</th>
                <th className="pb-1 pr-3 text-left">Body</th>
                <th className="pb-1 text-left">Fuel</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="border-t border-slate-100">
                  <td className="py-1 pr-3">
                    <input
                      type="checkbox"
                      checked={selected.has(v.id)}
                      onChange={() => toggle(v.id)}
                      aria-label={`Select variant ${v.id}`}
                    />
                  </td>
                  <td className="py-1 pr-3 text-slate-700">{v.year}</td>
                  <td className="py-1 pr-3 text-slate-500">{v.trim ?? '—'}</td>
                  <td className="py-1 pr-3 font-mono text-slate-500">{v.engineCode ?? '—'}</td>
                  <td className="py-1 pr-3 text-slate-500">{v.bodyType ?? '—'}</td>
                  <td className="py-1 text-slate-500">{v.fuel ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- GenerationRow ----------

interface GenerationRowProps {
  generation: AdminGeneration;
  allGenerations: AdminGeneration[];
  modelId: string;
  onEditDone: () => void;
}

function GenerationRow({
  generation,
  allGenerations,
  modelId,
  onEditDone,
}: GenerationRowProps): ReactElement {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const updateGeneration = useUpdateGeneration();
  const deleteGeneration = useDeleteGeneration();

  const years =
    generation.yearTo !== null
      ? `${generation.yearFrom}–${generation.yearTo}`
      : `${generation.yearFrom}–${t('admin.vehicles.present')}`;

  async function handleDelete(): Promise<void> {
    if (!confirm(t('admin.vehicles.confirmDelete', { name: generation.name }))) return;
    try {
      await deleteGeneration.mutateAsync({ id: generation.id, modelId });
      onEditDone();
    } catch (err) {
      alert(extractMessage(err));
    }
  }

  async function handleEditSubmit(values: GenerationFormValues): Promise<void> {
    await updateGeneration.mutateAsync({
      id: generation.id,
      modelId,
      body: formToUpdateRequest(values),
    });
    setEditing(false);
    onEditDone();
  }

  if (editing) {
    return (
      <>
        <tr className="bg-blue-50">
          <td colSpan={6} className="px-4 py-3">
            <GenerationForm
              initial={genToForm(generation)}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditing(false)}
              submitting={updateGeneration.isPending}
            />
          </td>
        </tr>
      </>
    );
  }

  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-4 py-2 font-mono text-xs text-slate-500">{generation.code ?? '—'}</td>
        <td className="px-4 py-2 font-medium text-slate-900">{generation.name}</td>
        <td className="px-4 py-2 font-mono text-xs text-slate-500">{generation.slug}</td>
        <td className="px-4 py-2 text-sm text-slate-500">{years}</td>
        <td className="px-4 py-2 text-right text-sm text-slate-500">{generation.variantCount}</td>
        <td className="px-4 py-2 text-right">
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label="Expand variants"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              aria-label={t('admin.vehicles.edit')}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteGeneration.isPending}
              className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700 disabled:opacity-40"
              aria-label={t('admin.vehicles.delete')}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <VariantsPanel
              generation={generation}
              allGenerations={allGenerations}
              modelId={modelId}
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ---------- GenerationsPanel ----------

interface GenerationsPanelProps {
  modelId: string;
}

function GenerationsPanel({ modelId }: GenerationsPanelProps): ReactElement {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useAdminGenerations(modelId);
  const createGeneration = useCreateGeneration(modelId);
  const [creating, setCreating] = useState(false);

  const generations: AdminGeneration[] = data ?? [];

  async function handleCreateSubmit(values: GenerationFormValues): Promise<void> {
    await createGeneration.mutateAsync(formToCreateRequest(values));
    setCreating(false);
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{t('admin.vehicles.generations')}</h2>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('admin.vehicles.newGeneration')}
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-3 text-sm font-medium text-blue-800">{t('admin.vehicles.newGeneration')}</p>
          <GenerationForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setCreating(false)}
            submitting={createGeneration.isPending}
          />
          {createGeneration.isError && (
            <p className="mt-2 text-xs text-red-600">{extractMessage(createGeneration.error)}</p>
          )}
        </div>
      )}

      {isLoading && (
        <p className="mt-4 text-sm text-slate-500">{t('catalog.loading')}</p>
      )}
      {isError && (
        <p className="mt-4 text-sm text-red-600">Failed to load generations.</p>
      )}

      {!isLoading && !isError && generations.length === 0 && (
        <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          {t('admin.vehicles.noGenerations')}
        </p>
      )}

      {generations.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">{t('admin.vehicles.cols.code')}</th>
                <th className="px-4 py-2 text-left">{t('admin.vehicles.cols.name')}</th>
                <th className="px-4 py-2 text-left">{t('admin.vehicles.cols.slug')}</th>
                <th className="px-4 py-2 text-left">{t('admin.vehicles.cols.years')}</th>
                <th className="px-4 py-2 text-right">{t('admin.vehicles.cols.variants')}</th>
                <th className="px-4 py-2 text-right">{t('admin.vehicles.cols.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {generations.map((g) => (
                <GenerationRow
                  key={g.id}
                  generation={g}
                  allGenerations={generations}
                  modelId={modelId}
                  onEditDone={() => {}}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- VehicleAdminPage ----------

export default function VehicleAdminPage(): ReactElement {
  const { t } = useTranslation();

  const [selectedMakeSlug, setSelectedMakeSlug] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  const { data: makes, isLoading: makesLoading } = useMakes();
  const { data: models, isLoading: modelsLoading } = useModels(selectedMakeSlug || undefined);

  function handleMakeChange(slug: string): void {
    setSelectedMakeSlug(slug);
    setSelectedModelId('');
  }

  const selectClass =
    'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-50';

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/admin" className="text-xs text-slate-500 hover:underline">
            ← Admin
          </Link>
          <h1 className="text-2xl font-semibold">{t('admin.vehicles.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('admin.vehicles.subtitle')}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-lg">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            {t('admin.vehicles.pickMake')}
          </label>
          <select
            className={selectClass}
            value={selectedMakeSlug}
            onChange={(e) => handleMakeChange(e.target.value)}
            disabled={makesLoading}
          >
            <option value="">— {t('admin.vehicles.pickMake')} —</option>
            {(makes ?? []).map((mk: VehicleMake) => (
              <option key={mk.id} value={mk.slug}>
                {mk.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            {t('admin.vehicles.pickModel')}
          </label>
          <select
            className={selectClass}
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            disabled={!selectedMakeSlug || modelsLoading}
          >
            <option value="">— {t('admin.vehicles.pickModel')} —</option>
            {(models ?? []).map((m: VehicleModel) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedModelId && (
        <p className="mt-8 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          {t('admin.vehicles.pickModelFirst')}
        </p>
      )}

      {selectedModelId && <GenerationsPanel modelId={selectedModelId} />}
    </main>
  );
}
