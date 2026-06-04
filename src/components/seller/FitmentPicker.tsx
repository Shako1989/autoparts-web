import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

import { useMakes, useModels, useYears } from '@/api/catalog';
import type { FitmentInput } from '@/api/listings';

type FitmentRow = FitmentInput & { label: string };

interface Props {
  value: FitmentRow[];
  onChange: (rows: FitmentRow[]) => void;
}

export function FitmentPicker({ value, onChange }: Props): ReactElement {
  const { t } = useTranslation();
  const [makeSlug, setMakeSlug] = useState('');
  const [modelSlug, setModelSlug] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);

  const makesQ = useMakes();
  const modelsQ = useModels(makeSlug || undefined);

  const modelId = useMemo(
    () => (modelsQ.data ?? []).find((m) => m.slug === modelSlug)?.id,
    [modelsQ.data, modelSlug],
  );
  const yearsQ = useYears(modelId);

  const make = useMemo(
    () => (makesQ.data ?? []).find((m) => m.slug === makeSlug),
    [makesQ.data, makeSlug],
  );
  const model = useMemo(
    () => (modelsQ.data ?? []).find((m) => m.slug === modelSlug),
    [modelsQ.data, modelSlug],
  );

  const canAdd = !!(makeSlug && modelSlug && year);

  function add(): void {
    if (!canAdd || !year || !make || !model) return;
    const exists = value.some(
      (r) => r.makeSlug === makeSlug && r.modelSlug === modelSlug && r.year === year,
    );
    if (!exists) {
      onChange([
        ...value,
        { makeSlug, modelSlug, year, label: `${make.name} ${model.name} ${year}` },
      ]);
    }
    setMakeSlug('');
    setModelSlug('');
    setYear(undefined);
  }

  function remove(index: number): void {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((r, i) => (
            <li
              key={`${r.makeSlug}-${r.modelSlug}-${r.year}`}
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <select
          value={makeSlug}
          onChange={(e) => {
            setMakeSlug(e.target.value);
            setModelSlug('');
            setYear(undefined);
          }}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">{t('catalog.vehiclePicker.selectMake')}</option>
          {(makesQ.data ?? []).map((m) => (
            <option key={m.id} value={m.slug}>{m.name}</option>
          ))}
        </select>
        <select
          value={modelSlug}
          onChange={(e) => {
            setModelSlug(e.target.value);
            setYear(undefined);
          }}
          disabled={!makeSlug}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-50"
        >
          <option value="">{t('catalog.vehiclePicker.selectModel')}</option>
          {(modelsQ.data ?? []).map((m) => (
            <option key={m.id} value={m.slug}>{m.name}</option>
          ))}
        </select>
        <select
          value={year ?? ''}
          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
          disabled={!modelSlug}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-50"
        >
          <option value="">{t('catalog.vehiclePicker.selectYear')}</option>
          {(yearsQ.data ?? []).map((y) => (
            <option key={y} value={y}>{y}</option>
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
