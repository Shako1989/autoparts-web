import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useCategoryTree, type CategoryNode } from '@/api/catalog';
import { CategoryIcon } from '@/components/catalog/CategoryIcon';

const MAX_TILES = 8;

export function CategoryTileGrid(): ReactElement {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useCategoryTree();

  if (isLoading) return <p className="text-sm text-slate-500">{t('catalog.loading')}</p>;
  if (isError || !data) return <p className="text-sm text-red-600">{t('catalog.empty')}</p>;

  // useCategoryTree already returns only root nodes, each with a nested
  // `children` array, so the array itself is the top-level list. No public
  // "all categories" route exists in App.tsx (only /admin/categories, which
  // is admin-gated), so the "See all" tile is intentionally omitted per the
  // founder's fallback rule rather than linking to a route that doesn't fit.
  const topLevel = data.slice(0, MAX_TILES);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {topLevel.map((node) => (
        <CategoryTile key={node.id} node={node} />
      ))}
    </div>
  );
}

function CategoryTile({ node }: { node: CategoryNode }): ReactElement {
  const { t } = useTranslation();

  return (
    <Link
      to={`/c/${node.slug}`}
      className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm hover:border-slate-400"
    >
      {node.iconUrl ? (
        <img src={node.iconUrl} alt="" className="h-6 w-6 object-contain" />
      ) : (
        <CategoryIcon slug={node.slug} className="h-6 w-6 text-slate-500" aria-hidden />
      )}
      <span className="font-medium text-sm">{node.name}</span>
      <span className="text-xs text-slate-500">
        {t('catalog.subcategoryCount', { count: node.children.length })}
      </span>
    </Link>
  );
}
