import { useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Folder } from 'lucide-react';
import { clsx } from 'clsx';

import {
  useCategory,
  useCategoryTree,
  usePartsInCategory,
  type CategoryNode,
  type PartListItem,
} from '@/api/catalog';
import { useSearch, type SearchHit } from '@/api/search';

interface Props {
  value: SearchHit | null;
  onChange: (hit: SearchHit | null) => void;
}

type Mode = 'browse' | 'search';

export function PartPicker({ value, onChange }: Props): ReactElement {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('browse');

  if (value) {
    return <SelectedSummary value={value} onClear={() => onChange(null)} />;
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-sm">
        <ModeTab
          active={mode === 'browse'}
          onClick={() => setMode('browse')}
          label={t('seller.partPicker.browse')}
        />
        <ModeTab
          active={mode === 'search'}
          onClick={() => setMode('search')}
          label={t('seller.partPicker.search')}
        />
      </div>

      {mode === 'search' ? (
        <SearchView onPick={onChange} />
      ) : (
        <BrowseView onPick={onChange} />
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded px-3 py-1 transition-colors',
        active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900',
      )}
    >
      {label}
    </button>
  );
}

function SelectedSummary({
  value,
  onClear,
}: {
  value: SearchHit;
  onClear: () => void;
}): ReactElement {
  const { t } = useTranslation();
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
        onClick={onClear}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        {t('actions.change') ?? 'Change'}
      </button>
    </div>
  );
}

function SearchView({ onPick }: { onPick: (hit: SearchHit) => void }): ReactElement {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearch(debounced, 0, 10);

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
      {data && data.items.length === 0 && debounced.length > 0 && !isLoading && (
        <p className="text-xs text-slate-500">{t('search.empty')}</p>
      )}
      {data && data.items.length > 0 && (
        <ul className="max-h-80 divide-y divide-slate-100 overflow-auto rounded-md border border-slate-200 bg-white">
          {data.items.map((hit) => (
            <li key={hit.partId}>
              <PartRow
                onClick={() => onPick(hit)}
                imageUrl={hit.defaultImageUrl}
                name={hit.name}
                subtitle={hit.brand}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BrowseView({ onPick }: { onPick: (hit: SearchHit) => void }): ReactElement {
  const { t } = useTranslation();
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  const treeQ = useCategoryTree();
  const categoryQ = useCategory(currentSlug ?? undefined);
  const partsQ = usePartsInCategory(currentSlug ?? undefined, 0, 50);

  const rootNodes: CategoryNode[] = treeQ.data ?? [];

  function pickPart(p: PartListItem, categorySlug: string): void {
    onPick({
      partId: p.id,
      name: p.name,
      brand: p.brand,
      categorySlug,
      defaultImageUrl: p.defaultImageUrl,
      activeListings: 0,
      minPriceMinor: null,
      currency: null,
    });
  }

  if (currentSlug && categoryQ.data) {
    const category = categoryQ.data;
    return (
      <div className="space-y-3">
        <Breadcrumbs
          trail={[
            { id: '__root', slug: '__root', name: t('seller.partPicker.allCategories') },
            ...category.breadcrumbs,
          ]}
          onJump={(slug) => setCurrentSlug(slug === '__root' ? null : slug)}
        />
        {category.children.length > 0 && (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {category.children.map((c) => (
              <li key={c.id}>
                <CategoryRow name={c.name} onClick={() => setCurrentSlug(c.slug)} />
              </li>
            ))}
          </ul>
        )}
        {partsQ.isLoading && <p className="text-xs text-slate-500">{t('catalog.loading')}</p>}
        {partsQ.data && partsQ.data.items.length === 0 && category.children.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
            {t('catalog.category.partsPlaceholder')}
          </p>
        )}
        {partsQ.data && partsQ.data.items.length > 0 && (
          <ul className="max-h-80 divide-y divide-slate-100 overflow-auto rounded-md border border-slate-200 bg-white">
            {partsQ.data.items.map((p) => (
              <li key={p.id}>
                <PartRow
                  onClick={() => pickPart(p, category.slug)}
                  imageUrl={p.defaultImageUrl}
                  name={p.name}
                  subtitle={p.brand}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {treeQ.isLoading && <p className="text-xs text-slate-500">{t('catalog.loading')}</p>}
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rootNodes.map((c) => (
          <li key={c.id}>
            <CategoryRow name={c.name} onClick={() => setCurrentSlug(c.slug)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Breadcrumbs({
  trail,
  onJump,
}: {
  trail: { id: string; slug: string; name: string }[];
  onJump: (slug: string) => void;
}): ReactElement {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-600">
      <ol className="flex flex-wrap items-center gap-1">
        {trail.map((node, idx) => {
          const isLast = idx === trail.length - 1;
          return (
            <li key={node.id} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
              {isLast ? (
                <span className="text-slate-800">{node.name}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onJump(node.slug)}
                  className="hover:underline"
                >
                  {node.name}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CategoryRow({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-slate-400"
    >
      <Folder className="h-4 w-4 flex-none text-slate-500" aria-hidden />
      <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{name}</span>
      <ChevronRight className="h-4 w-4 flex-none text-slate-400" aria-hidden />
    </button>
  );
}

function PartRow({
  onClick,
  imageUrl,
  name,
  subtitle,
}: {
  onClick: () => void;
  imageUrl: string | null;
  name: string;
  subtitle: string | null;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full rounded object-cover" />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-slate-900">{name}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>
    </button>
  );
}
