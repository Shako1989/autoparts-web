import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Car } from 'lucide-react';

import { useMakes } from '@/api/catalog';

interface PopularMakesProps {
  onSelect?: (slug: string) => void;
}

export function PopularMakes({ onSelect }: PopularMakesProps): ReactElement {
  const { t } = useTranslation();
  const { data, isLoading } = useMakes();

  function handleSelect(slug: string): void {
    onSelect?.(slug);
    document.getElementById('vehicle-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{t('catalog.popularMakes')}</h2>
      {isLoading && <p className="text-sm text-slate-500">{t('catalog.loading')}</p>}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {(data ?? []).slice(0, 12).map((make) => (
          <button
            key={make.id}
            type="button"
            onClick={() => handleSelect(make.slug)}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400 flex flex-col items-center gap-2 text-center"
          >
            {make.logoUrl ? (
              <img src={make.logoUrl} alt="" className="h-8 object-contain" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Car className="h-5 w-5 text-slate-500" />
              </div>
            )}
            <div className="text-sm font-medium mt-1">{make.name}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
