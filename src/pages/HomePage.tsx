import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { CategoryTileGrid } from '@/components/catalog/CategoryTileGrid';
import { HowItWorks } from '@/components/catalog/HowItWorks';
import { PopularMakes } from '@/components/catalog/PopularMakes';
import { VehiclePicker } from '@/components/catalog/VehiclePicker';
import { SellerHomeCta } from '@/components/marketing/SellerHomeCta';

export default function HomePage(): ReactElement {
  const { t } = useTranslation();
  const [presetMake, setPresetMake] = useState<string | undefined>(undefined);

  return (
    <main className="container mx-auto px-4 py-10">
      <section className="bg-slate-50 -mx-4 px-4 py-10 sm:mx-0 sm:rounded-lg">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            {t('hero.title')}
          </h1>
          <p className="mt-2 text-base text-slate-600">{t('hero.subtitle')}</p>

          {/* TODO: trust strip — pending real stats endpoint */}

          <p className="mt-8 text-xs uppercase tracking-wide text-slate-500">
            {t('hero.pickerEyebrow')}
          </p>
        </div>

        <div id="hero-picker" className="max-w-2xl mx-auto mt-3 bg-white rounded-lg">
          <VehiclePicker presetMakeSlug={presetMake} />
        </div>

        <div className="max-w-2xl mx-auto mt-3 text-center">
          <a href="#browse-categories" className="text-sm text-slate-600 hover:text-slate-900 underline">
            {t('hero.browseCategoriesLink')}
          </a>
        </div>
      </section>

      <section className="mt-12">
        <HowItWorks />
      </section>

      <section id="browse-categories" className="mt-12">
        <h2 className="text-lg font-semibold mb-3">{t('catalog.browseByCategoryTitle')}</h2>
        <CategoryTileGrid />
      </section>

      <section className="mt-12">
        <PopularMakes onSelect={setPresetMake} />
      </section>

      <section className="mt-12 -mx-4">
        <SellerHomeCta />
      </section>
    </main>
  );
}
