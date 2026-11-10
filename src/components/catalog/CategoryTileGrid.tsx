import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { useCategoryTree, type CategoryNode } from '@/api/catalog';
import { CategoryArtwork } from '@/components/catalog/CategoryArtwork';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function CategoryTileGrid(): ReactElement | null {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useCategoryTree();
  const loadedCount = data?.length;

  if (isError) return null;

  if (isLoading) {
    const skeletonCount = loadedCount ?? 8;
    return (
      <section className="container mx-auto px-4 py-10">
        <SectionHeading title={t('catalog.browseByCategoryTitle')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <div key={idx} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  const topLevel = data ?? [];
  if (topLevel.length === 0) return null;

  // TODO: cap at 8 + "see all" link if catalog grows

  return (
    <section className="container mx-auto px-4 py-10">
      <SectionHeading title={t('catalog.browseByCategoryTitle')} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topLevel.map((node) => (
          <CategoryTile key={node.id} node={node} />
        ))}
      </div>
    </section>
  );
}

function CategoryTile({ node }: { node: CategoryNode }): ReactElement {
  const { t } = useTranslation();

  return (
    <Link
      to={`/c/${node.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-card transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <CategoryArtwork category={node} className="h-14 w-14" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">{node.name}</span>
        {node.children.length > 0 && (
          <span className="block text-xs text-slate-500">
            {t('catalog.subcategoryCount', { count: node.children.length })}
          </span>
        )}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-brand" aria-hidden />
    </Link>
  );
}
