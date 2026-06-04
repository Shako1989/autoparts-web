import { useEffect, useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Car } from 'lucide-react';

import { useCategoryTree, useMakes, useModels } from '@/api/catalog';
import { CategoryIcon } from '@/components/catalog/CategoryIcon';
import { useGarageStore } from '@/store/garageStore';

export default function VehiclePage(): ReactElement {
  const { t } = useTranslation();
  const { makeSlug, modelSlug, year } = useParams<{
    makeSlug: string;
    modelSlug: string;
    year: string;
  }>();

  const yearNum = year ? Number(year) : Number.NaN;
  const makesQ = useMakes();
  const modelsQ = useModels(makeSlug);
  const treeQ = useCategoryTree();

  const make = useMemo(
    () => (makesQ.data ?? []).find((m) => m.slug === makeSlug),
    [makesQ.data, makeSlug],
  );
  const model = useMemo(
    () => (modelsQ.data ?? []).find((m) => m.slug === modelSlug),
    [modelsQ.data, modelSlug],
  );

  const isLoading = makesQ.isLoading || modelsQ.isLoading;
  const notFound = !isLoading && (!make || !model || Number.isNaN(yearNum));

  const setActive = useGarageStore((s) => s.setActive);
  useEffect(() => {
    if (makeSlug && modelSlug && !Number.isNaN(yearNum) && make && model) {
      setActive({
        variantId: `${makeSlug}-${modelSlug}-${yearNum}`,
        makeSlug,
        modelSlug,
        year: yearNum,
        label: `${make.name} ${model.name} ${yearNum}`,
      });
    }
  }, [makeSlug, modelSlug, yearNum, make, model, setActive]);

  return (
    <main className="container mx-auto px-4 py-10">
      {isLoading && <p className="text-sm text-slate-500">{t('catalog.loading')}</p>}

      {notFound && <p className="text-sm text-red-700">{t('catalog.empty')}</p>}

      {!isLoading && make && model && !Number.isNaN(yearNum) && (
        <>
          <header className="flex items-center gap-3">
            <Car className="h-8 w-8 text-slate-700" aria-hidden />
            <h1 className="text-3xl font-semibold">
              {t('catalog.vehicle.heading', { make: make.name, model: model.name, year: yearNum })}
            </h1>
          </header>

          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-3">{t('catalog.vehicle.browseCategories')}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(treeQ.data ?? []).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/c/${c.slug}`}
                    className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 hover:border-slate-400"
                  >
                    <CategoryIcon
                      slug={c.slug}
                      className="h-5 w-5 mt-0.5 flex-none text-slate-500"
                      aria-hidden
                    />
                    <div>
                      <span className="font-medium">{c.name}</span>
                      {c.children.length > 0 && (
                        <span className="block text-xs text-slate-500 mt-1">
                          {c.children.length} →
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold mb-3">{t('catalog.vehicle.partsHeading')}</h2>
            <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              {t('catalog.vehicle.partsPlaceholder')}
            </p>
          </section>
        </>
      )}
    </main>
  );
}
