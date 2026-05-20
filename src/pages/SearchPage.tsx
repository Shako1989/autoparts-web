import { useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import { useSearch, type SearchHit } from '@/api/search';
import { formatMoney } from '@/lib/format';

export default function SearchPage(): ReactElement {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [input, setInput] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(input);
      const next = new URLSearchParams(params);
      if (input.trim()) next.set('q', input.trim());
      else next.delete('q');
      setParams(next, { replace: true });
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const { data, isLoading } = useSearch(debounced);

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">{t('search.title')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('search.helper')}</p>

      <input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('search.placeholder')}
        className="mt-4 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        autoFocus
      />

      <section className="mt-6">
        {isLoading && debounced.length > 0 && (
          <p className="text-sm text-slate-500">{t('catalog.loading')}</p>
        )}
        {data && data.items.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            {t('search.empty')}
          </p>
        )}
        {data && data.items.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((hit) => (
              <li key={hit.partId}>
                <HitCard hit={hit} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function HitCard({ hit }: { hit: SearchHit }): ReactElement {
  const { t } = useTranslation();
  return (
    <Link
      to={`/p/${hit.partId}`}
      className="flex h-full flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 hover:border-slate-400"
    >
      <div className="aspect-[4/3] w-full bg-slate-50">
        {hit.defaultImageUrl ? (
          <img src={hit.defaultImageUrl} alt="" className="h-full w-full rounded object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">—</div>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium text-slate-900">{hit.name}</div>
        {hit.brand && <div className="text-xs text-slate-500">{hit.brand}</div>}
        <div className="mt-1 text-xs">
          {hit.activeListings > 0 && hit.minPriceMinor != null && hit.currency ? (
            <span className="font-medium text-emerald-700">
              {t('part.offersSummary', {
                count: hit.activeListings,
                price: formatMoney(hit.minPriceMinor, hit.currency),
              })}
            </span>
          ) : (
            <span className="text-slate-500">{t('part.noOffersYet')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
