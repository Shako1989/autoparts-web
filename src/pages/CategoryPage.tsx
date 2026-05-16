import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import {
  useCategory,
  useCategoryDiagrams,
  usePartsInCategory,
  type PartListItem,
} from '@/api/catalog';
import { CategoryIcon } from '@/components/catalog/CategoryIcon';
import { DiagramBlock } from '@/components/catalog/DiagramBlock';

export default function CategoryPage(): ReactElement {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useCategory(slug);
  const partsQ = usePartsInCategory(slug);
  const diagramsQ = useCategoryDiagrams(slug);

  if (isLoading) return <Page>{t('catalog.loading')}</Page>;
  if (isError || !data) return <Page>{t('catalog.empty')}</Page>;

  return (
    <Page>
      <Breadcrumbs trail={data.breadcrumbs} />
      <div className="mt-2 flex items-center gap-3">
        <CategoryIcon slug={data.slug} className="h-7 w-7 text-slate-700" aria-hidden />
        <h1 className="text-3xl font-semibold">{data.name}</h1>
      </div>

      {data.children.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">{t('catalog.category.subcategories')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.children.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/c/${c.slug}`}
                  className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 hover:border-slate-400"
                >
                  <CategoryIcon slug={c.slug} className="h-5 w-5 text-slate-500" aria-hidden />
                  <span className="font-medium">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {diagramsQ.data && diagramsQ.data.length > 0 && (
        <section className="mt-10 space-y-8">
          {diagramsQ.data.map((d) => (
            <article key={d.id}>
              <h2 className="text-lg font-semibold mb-3">{d.title}</h2>
              <DiagramBlock diagram={d} />
            </article>
          ))}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">
          {t('catalog.category.partsHeading')}
          {partsQ.data && (
            <span className="ml-2 text-sm font-normal text-slate-500">({partsQ.data.total})</span>
          )}
        </h2>

        {partsQ.isLoading && <p className="text-sm text-slate-500">{t('catalog.loading')}</p>}

        {partsQ.data && partsQ.data.items.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            {t('catalog.category.partsPlaceholder')}
          </p>
        )}

        {partsQ.data && partsQ.data.items.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {partsQ.data.items.map((p) => (
              <li key={p.id}>
                <PartCard part={p} categorySlug={data.slug} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}

function PartCard({ part, categorySlug }: { part: PartListItem; categorySlug: string }): ReactElement {
  return (
    <Link
      to={`/p/${part.id}`}
      className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 hover:border-slate-400"
    >
      <div className="flex h-12 w-12 flex-none items-center justify-center rounded bg-slate-100 text-slate-500">
        {part.defaultImageUrl ? (
          <img src={part.defaultImageUrl} alt="" className="h-full w-full rounded object-cover" />
        ) : (
          <CategoryIcon slug={categorySlug} className="h-5 w-5" aria-hidden />
        )}
      </div>
      <div className="min-w-0">
        <div className="font-medium text-slate-900 truncate">{part.name}</div>
        {part.brand && <div className="text-xs text-slate-500">{part.brand}</div>}
      </div>
    </Link>
  );
}

function Page({ children }: { children: React.ReactNode }): ReactElement {
  return <main className="container mx-auto px-4 py-10">{children}</main>;
}

function Breadcrumbs({
  trail,
}: {
  trail: { id: string; slug: string; name: string }[];
}): ReactElement {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link to="/" className="hover:underline">
            ⌂
          </Link>
        </li>
        {trail.map((node, idx) => {
          const isLast = idx === trail.length - 1;
          return (
            <li key={node.id} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" aria-hidden />
              {isLast ? (
                <span className="text-slate-700">{node.name}</span>
              ) : (
                <Link to={`/c/${node.slug}`} className="hover:underline">
                  {node.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
