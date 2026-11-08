import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Barcode, Car, Package, Search, ScanLine } from 'lucide-react';

import { VehiclePicker } from '@/components/catalog/VehiclePicker';
import { VinLookup } from '@/components/catalog/VinLookup';
import { cn } from '@/lib/cn';

type Tab = 'vehicle' | 'part' | 'oem' | 'vin';

const TABS: { id: Tab; icon: typeof Car; labelKey: string }[] = [
  { id: 'vehicle', icon: Car, labelKey: 'hero.tabs.byVehicle' },
  { id: 'part', icon: Package, labelKey: 'hero.tabs.byPartName' },
  { id: 'oem', icon: Barcode, labelKey: 'hero.tabs.byOem' },
  { id: 'vin', icon: ScanLine, labelKey: 'hero.tabs.byVin' },
];

interface HeroSearchProps {
  presetMakeSlug?: string;
}

/**
 * The white search card in the hero. Four ways in: by vehicle (the catalog
 * picker), by part name, by OEM number (both go to /search) and by VIN.
 */
export function HeroSearch({ presetMakeSlug }: HeroSearchProps): ReactElement {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('vehicle');
  const [makeSlug, setMakeSlug] = useState<string | undefined>(presetMakeSlug);

  function onVinMakeResolved(slug: string): void {
    setMakeSlug(slug);
    setTab('vehicle');
  }

  return (
    <div id="vehicle-picker" className="overflow-hidden rounded-2xl bg-white text-slate-900 shadow-hero">
      <div role="tablist" aria-label={t('hero.tabsLabel')} className="flex overflow-x-auto bg-slate-100 p-1.5">
        {TABS.map(({ id, icon: Icon, labelKey }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`hero-tab-${id}`}
              aria-selected={active}
              aria-controls={`hero-panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors sm:px-4',
                active
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="whitespace-nowrap">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`hero-panel-${tab}`}
        aria-labelledby={`hero-tab-${tab}`}
        className="p-4 sm:p-5"
      >
        {tab === 'vehicle' && <VehiclePicker compact hideVin presetMakeSlug={makeSlug} />}
        {tab === 'part' && (
          <TextSearch placeholder={t('hero.partNamePlaceholder')} label={t('hero.tabs.byPartName')} />
        )}
        {tab === 'oem' && (
          <TextSearch placeholder={t('hero.oemPlaceholder')} label={t('hero.tabs.byOem')} mono />
        )}
        {tab === 'vin' && <VinLookup onMakeResolved={onVinMakeResolved} />}
      </div>
    </div>
  );
}

interface TextSearchProps {
  label: string;
  placeholder: string;
  mono?: boolean;
}

function TextSearch({ label, placeholder, mono }: TextSearchProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  function submit(e: FormEvent): void {
    e.preventDefault();
    const q = value.trim();
    if (q.length === 0) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block flex-1 text-sm">
        <span className="mb-1 block font-medium text-slate-700">{label}</span>
        <span className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className={cn(
              'h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
              mono && 'font-mono uppercase tracking-wide',
            )}
          />
        </span>
      </label>
      <button
        type="submit"
        disabled={value.trim().length === 0}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:pointer-events-none disabled:opacity-50"
      >
        <Search className="h-4 w-4" aria-hidden />
        {t('hero.search')}
      </button>
    </form>
  );
}
