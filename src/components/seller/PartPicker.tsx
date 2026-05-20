import { useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useSearch, type SearchHit } from '@/api/search';

interface Props {
  value: SearchHit | null;
  onChange: (hit: SearchHit | null) => void;
}

export function PartPicker({ value, onChange }: Props): ReactElement {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearch(debounced, 0, 10);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-emerald-300 bg-emerald-50 p-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded bg-white">
          {value.defaultImageUrl ? (
            <img src={value.defaultImageUrl} alt="" className="h-full w-full rounded object-cover" />
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-slate-900">{value.name}</div>
          {value.brand && <div className="text-xs text-slate-500">{value.brand}</div>}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          {t('actions.change') ?? 'Change'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('seller.partPickerPlaceholder')}
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
      />
      {isLoading && debounced.length > 0 && (
        <p className="text-xs text-slate-500">{t('catalog.loading')}</p>
      )}
      {data && data.items.length > 0 && (
        <ul className="max-h-80 divide-y divide-slate-100 overflow-auto rounded-md border border-slate-200 bg-white">
          {data.items.map((hit) => (
            <li key={hit.partId}>
              <button
                type="button"
                onClick={() => onChange(hit)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded bg-slate-100">
                  {hit.defaultImageUrl ? (
                    <img src={hit.defaultImageUrl} alt="" className="h-full w-full rounded object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900">{hit.name}</div>
                  <div className="text-xs text-slate-500">
                    {hit.brand ?? ''} {hit.activeListings > 0 && `· ${hit.activeListings} offers`}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
