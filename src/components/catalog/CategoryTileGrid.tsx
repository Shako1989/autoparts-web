import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useCategoryTree, type CategoryNode } from '@/api/catalog';
import { CategoryIcon } from '@/components/catalog/CategoryIcon';

export function CategoryTileGrid(): ReactElement | null {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useCategoryTree();
  const loadedCount = data?.length;

  if (isError) return null;

  if (isLoading) {
    const skeletonCount = loadedCount ?? 8;
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">{t('catalog.browseByCategoryTitle')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <div key={idx} className="bg-slate-100 animate-pulse rounded-lg h-24" />
          ))}
        </div>
      </section>
    );
  }

  const topLevel = data ?? [];
  if (topLevel.length === 0) return null;

  // TODO: cap at 8 + "see all" link if catalog grows

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">{t('catalog.browseByCategoryTitle')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
      className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400 flex flex-col items-start gap-2"
    >
      {node.iconUrl ? (
        <img src={node.iconUrl} alt="" className="h-6 w-6 object-contain" />
      ) : (
        <CategoryIcon slug={node.slug} className="h-6 w-6 text-slate-600" />
      )}
      <div className="font-medium text-sm">{node.name}</div>
      {node.children.length > 0 && (
        <div className="text-xs text-slate-500">
          {t('catalog.subcategoryCount', { count: node.children.length })}
        </div>
      )}
    </Link>
  );
}
