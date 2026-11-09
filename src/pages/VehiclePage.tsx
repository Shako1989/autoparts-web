import { useEffect, useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Car } from 'lucide-react';

import { useCategoryTree, useGenerations, useMakes, useModels, useVariants } from '@/api/catalog';
import { CategoryIcon } from '@/components/catalog/CategoryIcon';
import {
  garageVehicleKey,
  garageVehicleLabel,
  useActiveVehicle,
  useGarageStore,
} from '@/store/garageStore';

export default function VehiclePage(): ReactElement {
  const { t } = useTranslation();
  const { makeSlug, modelSlug, year } = useParams<{
    makeSlug: string;
    modelSlug: string;
    year: string;
  }>();
  const [searchParams] = useSearchParams();
  const variantParam = searchParams.get('variant') || undefined;

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

  // Only needed to name the version behind `?variant=`; the model-year page works without it.
  const generationsQ = useGenerations(model?.id);
  const variantsQ = useVariants(model?.id, variantParam && !Number.isNaN(yearNum) ? yearNum : undefined);
  const variant = useMemo(
    () => (variantParam ? (variantsQ.data ?? []).find((v) => v.id === variantParam) : undefined),
    [variantsQ.data, variantParam],
  );
  const generation = useMemo(() => {
    const all = generationsQ.data ?? [];
    if (variant) return all.find((g) => g.id === variant.generationId);
    return all.length === 1 ? all[0] : undefined;
  }, [generationsQ.data, variant]);

  const isLoading = makesQ.isLoading || modelsQ.isLoading;
  const notFound = !isLoading && (!make || !model || Number.isNaN(yearNum));

  const active = useActiveVehicle();
  const setActive = useGarageStore((s) => s.setActive);
  useEffect(() => {
    if (!make || !model || Number.isNaN(yearNum)) return;
    // The picker already added this exact car before navigating here; don't
    // shadow it with a looser copy. Deep links and reloads fall through.
    const alreadyActive =
      active !== null
      && active.makeSlug === make.slug
      && active.modelSlug === model.slug
      && active.year === yearNum
      && (active.vehicleVariantId ?? undefined) === variantParam;
    if (alreadyActive) return;
    if (!generationsQ.isSuccess || (variantParam && !variantsQ.isSuccess)) return;

    setActive({
      variantId: garageVehicleKey({
        makeSlug: make.slug,
        modelSlug: model.slug,
        generationSlug: generation?.slug,
        year: yearNum,
        vehicleVariantId: variant?.id,
      }),
      makeSlug: make.slug,
      modelSlug: model.slug,
      year: yearNum,
      label: garageVehicleLabel({
        makeName: make.name,
        modelName: model.name,
        generationCode: generation?.code,
        year: yearNum,
        trim: variant?.trim,
        engineCode: variant?.engineCode,
      }),
      ...(generation ? { generationSlug: generation.slug, generationCode: generation.code } : {}),
      ...(variant ? { vehicleVariantId: variant.id, trim: variant.trim, engineCode: variant.engineCode } : {}),
    });
  }, [
    make,
    model,
    yearNum,
    variantParam,
    variant,
    generation,
    generationsQ.isSuccess,
    variantsQ.isSuccess,
    active,
    setActive,
  ]);

  const version = [generation?.code, variant?.trim, variant?.engineCode]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join(' · ');

  return (
    <main className="container mx-auto px-4 py-10">
      {isLoading && <p className="text-sm text-slate-500">{t('catalog.loading')}</p>}

      {notFound && <p className="text-sm text-red-700">{t('catalog.empty')}</p>}

      {!isLoading && make && model && !Number.isNaN(yearNum) && (
        <>
          <header className="flex items-center gap-3">
            <Car className="h-8 w-8 text-slate-700" aria-hidden />
            <div>
              <h1 className="text-3xl font-semibold">
                {t('catalog.vehicle.heading', { make: make.name, model: model.name, year: yearNum })}
              </h1>
              {version && <p className="mt-1 text-sm text-slate-600">{version}</p>}
            </div>
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
