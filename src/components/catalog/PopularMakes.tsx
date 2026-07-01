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
    document.getElementById('hero-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{t('catalog.popularMakes')}</h2>
      {isLoading && <p className="text-sm text-slate-500">{t('catalog.loading')}</p>}
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(data ?? []).slice(0, 10).map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => handleSelect(m.slug)}
              className="w-full rounded-md border border-slate-200 bg-white p-3 text-center text-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              {m.logoUrl ? (
                <img src={m.logoUrl} alt="" className="h-8 mx-auto object-contain" />
              ) : (
                <div className="h-8 w-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                  <Car className="h-4 w-4 text-slate-500" aria-hidden />
                </div>
              )}
              <div className="mt-2 font-medium">{m.name}</div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
