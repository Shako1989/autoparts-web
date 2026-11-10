import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  useCategoryPartCounts,
  useCategoryTree,
  useGenerations,
  useMakes,
  useModels,
  useVariants,
  type VehicleFilter,
} from '@/api/catalog';
import { VehiclePicker } from '@/components/catalog/VehiclePicker';
import { VehicleCategoryGrid } from '@/components/vehicle/VehicleCategoryGrid';
import { VehicleHero } from '@/components/vehicle/VehicleHero';
import { VehicleInfoCard } from '@/components/vehicle/VehicleInfoCard';
import { VehiclePartsStrip } from '@/components/vehicle/VehiclePartsStrip';
import { vehicleImageUrl } from '@/lib/catalogImages';
import { vehiclePagePath } from '@/lib/vehiclePath';
import {
  garageVehicleKey,
  garageVehicleLabel,
  useActiveVehicle,
  useGarageStore,
} from '@/store/garageStore';

export default function VehiclePage(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  // Without a variant the model year still names the generation when only
  // one was built that year (CD391 for a 2015 Fusion); overlapping years stay open.
  const generation = useMemo(() => {
    const all = generationsQ.data ?? [];
    if (variant) return all.find((g) => g.id === variant.generationId);
    const inYear = all.filter((g) => yearNum >= g.yearFrom && (g.yearTo === null || yearNum <= g.yearTo));
    return inYear.length === 1 ? inYear[0] : undefined;
  }, [generationsQ.data, variant, yearNum]);

  const isLoading = makesQ.isLoading || modelsQ.isLoading;
  const notFound = !isLoading && (!make || !model || Number.isNaN(yearNum));
  const ready = !isLoading && !!make && !!model && !Number.isNaN(yearNum);

  // The exact variant from the URL narrows the counts and the parts strip;
  // the model year alone matches any variant of that year.
  const filter: VehicleFilter = {
    makeSlug,
    modelSlug,
    year: Number.isNaN(yearNum) ? null : yearNum,
    variantId: variantParam ?? null,
  };
  const countsQ = useCategoryPartCounts(filter, ready);

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLElement>(null);
  function openPicker(): void {
    setPickerOpen(true);
    // Let it render, then bring it into view.
    requestAnimationFrame(() => pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

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

  const carImage = make && model ? vehicleImageUrl(make.slug, model.slug, generation?.code) : undefined;

  return (
    <main className="bg-slate-50">
      {isLoading && (
        <p className="container mx-auto px-4 py-10 text-sm text-slate-500">{t('catalog.loading')}</p>
      )}

      {notFound && (
        <p className="container mx-auto px-4 py-10 text-sm text-red-700">{t('catalog.empty')}</p>
      )}

      {ready && make && model && (
        <>
          <VehicleHero
            make={make}
            model={model}
            year={yearNum}
            generation={generation}
            variant={variant}
            imageUrl={carImage}
            onChangeVehicle={openPicker}
          />

          <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-10">
            <div className="min-w-0">
              {pickerOpen && (
                <section
                  ref={pickerRef}
                  id="change-vehicle"
                  className="mb-8 scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
                >
                  <h2 className="mb-3 text-lg font-bold text-slate-900">{t('catalog.vehicle.changeVehicle')}</h2>
                  <VehiclePicker
                    compact
                    hideVin
                    presetMakeSlug={make.slug}
                    onPicked={(picked) => {
                      setPickerOpen(false);
                      navigate(vehiclePagePath(picked));
                    }}
                  />
                </section>
              )}

              <VehicleCategoryGrid tree={treeQ.data ?? []} counts={countsQ.data} loading={treeQ.isLoading} />

              <VehiclePartsStrip filter={filter} vehicleLabel={`${make.name} ${model.name} ${yearNum}`} />
            </div>

            <VehicleInfoCard
              make={make}
              model={model}
              year={yearNum}
              generation={generation}
              variant={variant}
              imageUrl={carImage}
              pickerOpen={pickerOpen}
              onTogglePicker={() => (pickerOpen ? setPickerOpen(false) : openPicker())}
            />
          </div>
        </>
      )}
    </main>
  );
}
