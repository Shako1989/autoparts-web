import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

import {
  useGenerations,
  useMakes,
  useModels,
  useVariantsByGeneration,
  useYearsByGeneration,
} from '@/api/catalog';
import { fitmentRowKey, type FitmentRow } from '@/lib/fitments';
import { narrowVariants } from '@/lib/variants';
import { garageVehicleLabel } from '@/store/garageStore';

interface Props {
  value: FitmentRow[];
  onChange: (rows: FitmentRow[]) => void;
}

/**
 * Builds fitment rules for a part or a listing: Make → Model → (Generation) →
 * Year, then an optional Trim and Engine. Leaving trim and engine blank fits
 * the whole model year; setting them fits only the matching variants, which is
 * what engine-specific parts need.
 */
export function FitmentPicker({ value, onChange }: Props): ReactElement {
  const { t } = useTranslation();
  const [makeSlug, setMakeSlug] = useState('');
  const [modelSlug, setModelSlug] = useState('');
  const [generationId, setGenerationId] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [trim, setTrim] = useState('');
  const [engine, setEngine] = useState('');

  const makesQ = useMakes();
  const modelsQ = useModels(makeSlug || undefined);

  const make = useMemo(
    () => (makesQ.data ?? []).find((m) => m.slug === makeSlug),
    [makesQ.data, makeSlug],
  );
  const model = useMemo(
    () => (modelsQ.data ?? []).find((m) => m.slug === modelSlug),
    [modelsQ.data, modelSlug],
  );

  const generationsQ = useGenerations(model?.id);
  useEffect(() => {
    const sole = generationsQ.data?.length === 1 ? generationsQ.data[0] : undefined;
    if (sole) setGenerationId(sole.id);
  }, [generationsQ.data]);
  const showGenerationStep = (generationsQ.data ?? []).length > 1;
  const generation = useMemo(
    () => (generationsQ.data ?? []).find((g) => g.id === generationId),
    [generationsQ.data, generationId],
  );

  const yearsQ = useYearsByGeneration(generationId || undefined);
  const variantsQ = useVariantsByGeneration(generationId || undefined, year);
  const narrowed = useMemo(
    () => narrowVariants(variantsQ.data ?? [], trim, engine),
    [variantsQ.data, trim, engine],
  );
  const trimValue = trim || narrowed.resolved?.trim || '';
  const engineValue = engine || narrowed.resolved?.engineCode || '';

  const canAdd = !!(make && model && generation && year);

  function reset(): void {
    setMakeSlug('');
    setModelSlug('');
    setGenerationId('');
    setYear(undefined);
    setTrim('');
    setEngine('');
  }

  function add(): void {
    if (!canAdd || !year || !make || !model || !generation) return;
    const row: FitmentRow = {
      makeSlug,
      modelSlug,
      year,
      generationSlug: generation.slug,
      ...(trimValue ? { trim: trimValue } : {}),
      ...(engineValue ? { engineCode: engineValue } : {}),
      label: garageVehicleLabel({
        makeName: make.name,
        modelName: model.name,
        generationCode: generation.code,
        year,
        trim: trimValue || null,
        engineCode: engineValue || null,
      }),
    };
    if (!value.some((r) => fitmentRowKey(r) === fitmentRowKey(row))) {
      onChange([...value, row]);
    }
    reset();
  }

  function remove(index: number): void {
    onChange(value.filter((_, i) => i !== index));
  }

  const selectClass =
    'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400';

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((r, i) => (
            <li
              key={fitmentRowKey(r)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-xs"
            >
              <span>{r.label}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-full p-0.5 hover:bg-slate-200"
                aria-label={t('actions.remove') ?? 'Remove'}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <select
          aria-label={t('catalog.vehiclePicker.selectMake')}
          value={makeSlug}
          onChange={(e) => {
            setMakeSlug(e.target.value);
            setModelSlug('');
            setGenerationId('');
            setYear(undefined);
            setTrim('');
            setEngine('');
          }}
          className={selectClass}
        >
          <option value="">{t('catalog.vehiclePicker.selectMake')}</option>
          {(makesQ.data ?? []).map((m) => (
            <option key={m.id} value={m.slug}>{m.name}</option>
          ))}
        </select>
        <select
          aria-label={t('catalog.vehiclePicker.selectModel')}
          value={modelSlug}
          onChange={(e) => {
            setModelSlug(e.target.value);
            setGenerationId('');
            setYear(undefined);
            setTrim('');
            setEngine('');
          }}
          disabled={!makeSlug}
          className={selectClass}
        >
          <option value="">{t('catalog.vehiclePicker.selectModel')}</option>
          {(modelsQ.data ?? []).map((m) => (
            <option key={m.id} value={m.slug}>{m.name}</option>
          ))}
        </select>
        {showGenerationStep && (
          <select
            aria-label={t('catalog.vehiclePicker.selectGeneration')}
            value={generationId}
            onChange={(e) => {
              setGenerationId(e.target.value);
              setYear(undefined);
              setTrim('');
              setEngine('');
            }}
            className={selectClass}
          >
            <option value="">{t('catalog.vehiclePicker.selectGeneration')}</option>
            {(generationsQ.data ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.code ?? g.name} ({g.yearFrom}–{g.yearTo ?? '…'})
              </option>
            ))}
          </select>
        )}
        <select
          aria-label={t('catalog.vehiclePicker.selectYear')}
          value={year ?? ''}
          onChange={(e) => {
            setYear(e.target.value ? Number(e.target.value) : undefined);
            setTrim('');
            setEngine('');
          }}
          disabled={!generationId}
          className={selectClass}
        >
          <option value="">{t('catalog.vehiclePicker.selectYear')}</option>
          {(yearsQ.data ?? []).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          aria-label={t('catalog.vehiclePicker.selectTrim')}
          value={trimValue}
          onChange={(e) => setTrim(e.target.value)}
          disabled={!year || narrowed.trims.length === 0}
          className={selectClass}
        >
          <option value="">{t('catalog.vehiclePicker.anyTrim')}</option>
          {narrowed.trims.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <select
          aria-label={t('catalog.vehiclePicker.selectEngine')}
          value={engineValue}
          onChange={(e) => setEngine(e.target.value)}
          disabled={!year || narrowed.engines.length === 0}
          className={selectClass}
        >
          <option value="">{t('catalog.vehiclePicker.anyEngine')}</option>
          {narrowed.engines.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {t('actions.add') ?? 'Add'}
        </button>
      </div>
    </div>
  );
}
