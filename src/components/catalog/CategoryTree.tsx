import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useCategoryTree, type CategoryNode } from '@/api/catalog';
import { ChevronRight } from 'lucide-react';

export function CategoryTree(): ReactElement {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useCategoryTree();

  if (isLoading) return <p className="text-sm text-slate-500">{t('catalog.loading')}</p>;
  if (isError || !data) return <p className="text-sm text-red-600">{t('catalog.empty')}</p>;

  return (
    <nav aria-label={t('catalog.categories')}>
      <h2 className="text-lg font-semibold mb-2">{t('catalog.categories')}</h2>
      <ul className="space-y-1">
        {data.map((node) => (
          <CategoryItem key={node.id} node={node} depth={0} />
        ))}
      </ul>
    </nav>
  );
}

function CategoryItem({ node, depth }: { node: CategoryNode; depth: number }): ReactElement {
  const hasChildren = node.children.length > 0;
  return (
    <li>
      <Link
        to={`/c/${node.slug}`}
        className="flex items-center gap-1 rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
        style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
      >
        {hasChildren ? <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden /> : <span className="w-3" />}
        <span>{node.name}</span>
      </Link>
      {hasChildren && (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <CategoryItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
