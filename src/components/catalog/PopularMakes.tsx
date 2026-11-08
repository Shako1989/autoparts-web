import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Car } from 'lucide-react';

import { useMakes } from '@/api/catalog';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface PopularMakesProps {
  onSelect?: (slug: string) => void;
}

const MAX_MAKES = 12;

export function PopularMakes({ onSelect }: PopularMakesProps): ReactElement | null {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useMakes();

  function handleSelect(slug: string): void {
    onSelect?.(slug);
    document.getElementById('vehicle-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const makes = (data ?? []).slice(0, MAX_MAKES);
  if (isError || (!isLoading && makes.length === 0)) return null;

  return (
    <section>
      <SectionHeading title={t('catalog.popularMakes')} />
      {isLoading && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: MAX_MAKES }).map((_, idx) => (
            <div key={idx} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {makes.map((make) => (
          <button
            key={make.id}
            type="button"
            onClick={() => handleSelect(make.slug)}
            className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-card transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            {make.logoUrl ? (
              <img src={make.logoUrl} alt="" className="h-10 object-contain" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-brand-soft group-hover:text-brand">
                <Car className="h-5 w-5" aria-hidden />
              </span>
            )}
            <span className="text-sm font-semibold text-slate-800">{make.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
