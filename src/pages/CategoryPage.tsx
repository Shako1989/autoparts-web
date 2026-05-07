import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { useCategory } from '@/api/catalog';

export default function CategoryPage(): ReactElement {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useCategory(slug);

  if (isLoading) return <Page>{t('catalog.loading')}</Page>;
  if (isError || !data) return <Page>{t('catalog.empty')}</Page>;

  return (
    <Page>
      <Breadcrumbs trail={data.breadcrumbs} />
      <h1 className="text-3xl font-semibold mt-2">{data.name}</h1>

      {data.children.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">{t('catalog.category.subcategories')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.children.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/c/${c.slug}`}
                  className="block rounded-md border border-slate-200 bg-white p-3 hover:border-slate-400"
                >
                  <span className="font-medium">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">{t('catalog.category.partsHeading')}</h2>
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          {t('catalog.category.partsPlaceholder')}
        </p>
      </section>
    </Page>
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
