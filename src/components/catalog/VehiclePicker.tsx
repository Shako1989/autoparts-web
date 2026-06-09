import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useMakes, useModels, useYears } from '@/api/catalog';
import { Button } from '@/components/ui/Button';
import { useGarageStore } from '@/store/garageStore';

interface VehiclePickerProps {
  presetMakeSlug?: string;
  /** Hide the card chrome (title + padding) for inline embedding. */
  compact?: boolean;
  /**
   * Called after the picked vehicle is added to the garage and set active.
   * When provided, the picker does NOT navigate to /v/... — caller controls.
   */
  onPicked?: (vehicle: { makeSlug: string; modelSlug: string; year: number }) => void;
}

/**
 * Outer wrapper. Remounts whenever {@code presetMakeSlug} changes so the
 * inner picker resets cleanly without a setState-in-effect dance.
 */
export function VehiclePicker(props: VehiclePickerProps = {}): ReactElement {
  return <VehiclePickerInner key={props.presetMakeSlug ?? '__none__'} {...props} />;
}

function VehiclePickerInner({
  presetMakeSlug,
  compact,
  onPicked,
}: VehiclePickerProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addVehicle = useGarageStore((s) => s.add);

  const [makeSlug, setMakeSlug] = useState<string>(presetMakeSlug ?? '');
  const [modelSlug, setModelSlug] = useState<string>('');
  const [year, setYear] = useState<number | undefined>(undefined);

  const makesQ = useMakes();
  const modelsQ = useModels(makeSlug || undefined);

  const modelId = useMemo(
    () => (modelsQ.data ?? []).find((m) => m.slug === modelSlug)?.id,
    [modelsQ.data, modelSlug],
  );

  const yearsQ = useYears(modelId);

  function onMake(slug: string): void {
    setMakeSlug(slug);
    setModelSlug('');
    setYear(undefined);
  }

  function onModel(slug: string): void {
    setModelSlug(slug);
    setYear(undefined);
  }

  function onYear(value: string): void {
    setYear(value ? Number(value) : undefined);
  }

  const canSubmit = !!(makeSlug && modelSlug && year);

  function submit(): void {
    if (!canSubmit || !year) return;
    addVehicle({
      variantId: `${makeSlug}-${modelSlug}-${year}`,
      makeSlug,
      modelSlug,
      year,
      label: `${makeSlug} ${modelSlug} ${year}`,
    });
    if (onPicked) {
      onPicked({ makeSlug, modelSlug, year });
    } else {
      navigate(`/v/${makeSlug}/${modelSlug}/${year}`);
    }
  }

  return (
    <div className={compact ? '' : 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm'}>
      {!compact && <h2 className="text-lg font-semibold mb-3">{t('catalog.vehiclePicker.title')}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectField
          label={t('catalog.vehiclePicker.selectMake')}
          value={makeSlug}
          onChange={onMake}
          loading={makesQ.isLoading}
          options={(makesQ.data ?? []).map((m) => ({ value: m.slug, label: m.name }))}
        />
        <SelectField
          label={t('catalog.vehiclePicker.selectModel')}
          value={modelSlug}
          onChange={onModel}
          disabled={!makeSlug}
          loading={modelsQ.isFetching && !!makeSlug}
          options={(modelsQ.data ?? []).map((m) => ({ value: m.slug, label: m.name }))}
        />
        <SelectField
          label={t('catalog.vehiclePicker.selectYear')}
          value={year ? String(year) : ''}
          onChange={onYear}
          disabled={!modelId}
          loading={yearsQ.isFetching && !!modelId}
          options={(yearsQ.data ?? []).map((y) => ({ value: String(y), label: String(y) }))}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={!canSubmit}>
          {t('catalog.vehiclePicker.find')}
        </Button>
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  loading?: boolean;
}

function SelectField({ label, value, onChange, options, disabled, loading }: SelectFieldProps): ReactElement {
  return (
    <label className="block text-sm">
      <span className="block text-slate-600 mb-1">{label}</span>
      <select
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50 disabled:text-slate-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
      >
        <option value="">{loading ? '…' : '—'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
