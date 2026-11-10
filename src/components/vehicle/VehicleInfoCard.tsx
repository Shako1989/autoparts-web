import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, CheckCircle2, ChevronDown, Crosshair, RefreshCw, Settings } from 'lucide-react';

import type { VehicleGeneration, VehicleMake, VehicleModel, VehicleVariant } from '@/api/catalog';
import { cn } from '@/lib/cn';
import { capitalise } from '@/lib/format';

interface VehicleInfoCardProps {
  make: VehicleMake;
  model: VehicleModel;
  year: number;
  generation?: VehicleGeneration;
  variant?: VehicleVariant;
  imageUrl?: string;
  pickerOpen: boolean;
  onTogglePicker: () => void;
}

/** Sidebar: the car's photo and facts, the "change vehicle" toggle and the buying tips. */
export function VehicleInfoCard({
  make,
  model,
  year,
  generation,
  variant,
  imageUrl,
  pickerOpen,
  onTogglePicker,
}: VehicleInfoCardProps): ReactElement {
  const { t } = useTranslation();
  const rows: [string, string | null | undefined][] = [
    [t('catalog.vehicle.info.make'), make.name],
    [t('catalog.vehicle.info.model'), model.name],
    [t('catalog.vehicle.info.year'), String(year)],
    [t('catalog.vehicle.info.generation'), generation ? (generation.code ?? generation.name) : null],
    [t('catalog.vehicle.info.trim'), variant?.trim],
    [t('catalog.vehicle.info.engine'), variant?.engineCode],
    [t('catalog.vehicle.info.fuel'), variant?.fuel ? t(`catalog.fuel.${variant.fuel}`) : null],
    [t('catalog.vehicle.info.body'), variant?.bodyType ? capitalise(variant.bodyType) : null],
  ];

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        {imageUrl && <img src={imageUrl} alt="" className="mx-auto h-44 w-full object-contain" />}
        <h2 className="mt-2 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Car className="h-5 w-5 text-brand" aria-hidden />
          {t('catalog.vehicle.info.title')}
        </h2>
        <dl className="mt-2 divide-y divide-slate-100 text-sm">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
        </dl>
        <button
          type="button"
          aria-expanded={pickerOpen}
          aria-controls="change-vehicle"
          onClick={onTogglePicker}
          className="mt-3 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-brand hover:text-brand"
        >
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden />
            {t('catalog.vehicle.changeVehicle')}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', pickerOpen && 'rotate-180')} aria-hidden />
        </button>
      </div>

      <FindPartTips />
    </aside>
  );
}

const TIPS = ['oem', 'trim', 'compare'] as const;

function FindPartTips(): ReactElement {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-brand-soft/70 p-4">
      <Settings aria-hidden className="absolute -bottom-7 -right-7 h-32 w-32 text-brand/10" />
      <h2 className="relative flex items-center gap-2 text-base font-bold text-slate-900">
        <Crosshair className="h-5 w-5 text-brand" aria-hidden />
        {t('catalog.vehicle.tips.title')}
      </h2>
      <ul className="relative mt-3 space-y-2 text-sm text-slate-700">
        {TIPS.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
            {t(`catalog.vehicle.tips.${tip}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
