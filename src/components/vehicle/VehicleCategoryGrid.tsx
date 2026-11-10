import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ChevronUp } from 'lucide-react';

import type { CategoryNode } from '@/api/catalog';
import { CategoryArtwork } from '@/components/catalog/CategoryArtwork';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';

interface VehicleCategoryGridProps {
  tree: CategoryNode[];
  /**
   * `{ [categoryId]: parts that fit the car }`, rolled up to the roots.
   * Absent while loading or when the API does not provide it yet; the cards
   * then show their subcategory count instead.
   */
  counts?: Record<string, number>;
  loading?: boolean;
}

/** Root categories as photo cards, with every leaf reachable behind "view all". */
export function VehicleCategoryGrid({ tree, counts, loading }: VehicleCategoryGridProps): ReactElement {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  return (
    <section>
      <SectionHeading
        accent
        title={t('catalog.vehicle.browseCategories')}
        action={
          tree.length > 0 && (
            <button
              type="button"
              aria-expanded={showAll}
              onClick={() => setShowAll((open) => !open)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              {t(showAll ? 'catalog.vehicle.hideAllCategories' : 'catalog.vehicle.viewAllCategories')}
              {showAll ? (
                <ChevronUp className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden />
              )}
            </button>
          )
        }
      />

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-[88px] animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tree.map((node) => (
          <li key={node.id}>
            <CategoryCard node={node} count={counts?.[node.id]} countsKnown={counts !== undefined} />
          </li>
        ))}
      </ul>

      {showAll && <AllLeaves tree={tree} counts={counts} />}
    </section>
  );
}

function CategoryCard({
  node,
  count,
  countsKnown,
}: {
  node: CategoryNode;
  count: number | undefined;
  countsKnown: boolean;
}): ReactElement {
  const { t } = useTranslation();
  let detail: string | null = null;
  if (countsKnown) {
    detail = count ? t('catalog.vehicle.partCount', { count }) : t('catalog.vehicle.noPartsYet');
  } else if (node.children.length > 0) {
    detail = t('catalog.subcategoryCount', { count: node.children.length });
  }

  return (
    <Link
      to={`/c/${node.slug}`}
      className="group flex h-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 pr-4 shadow-card transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <CategoryArtwork category={node} className="h-16 w-24" />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{node.name}</span>
        {detail && (
          <span className={cn('block text-sm', countsKnown && !count ? 'text-slate-400' : 'text-slate-500')}>
            {detail}
          </span>
        )}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-brand" aria-hidden />
    </Link>
  );
}

function AllLeaves({ tree, counts }: { tree: CategoryNode[]; counts?: Record<string, number> }): ReactElement {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:grid-cols-2 xl:grid-cols-3">
      {tree.map((root) => (
        <div key={root.id}>
          <Link to={`/c/${root.slug}`} className="text-sm font-bold text-slate-900 hover:text-brand">
            {root.name}
          </Link>
          {root.children.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {root.children.map((leaf) => {
                const n = counts?.[leaf.id] ?? 0;
                const muted = counts !== undefined && n === 0;
                return (
                  <li key={leaf.id}>
                    <Link
                      to={`/c/${leaf.slug}`}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-brand hover:text-brand',
                        muted ? 'border-slate-200 text-slate-400' : 'border-slate-300 text-slate-800',
                      )}
                    >
                      {leaf.name}
                      {n > 0 && <span className="text-slate-400">{n}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
