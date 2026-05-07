import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useMakes } from '@/api/catalog';

interface PopularMakesProps {
  onSelect?: (slug: string) => void;
}

export function PopularMakes({ onSelect }: PopularMakesProps): ReactElement {
  const { t } = useTranslation();
  const { data, isLoading } = useMakes();

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{t('catalog.popularMakes')}</h2>
      {isLoading && <p className="text-sm text-slate-500">{t('catalog.loading')}</p>}
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(data ?? []).slice(0, 10).map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onSelect?.(m.slug)}
              className="w-full rounded-md border border-slate-200 bg-white p-3 text-center text-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-slate-500">★ {m.popularity}</div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
