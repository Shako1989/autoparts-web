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
    <main>
      <section className="bg-slate-50">
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 text-center max-w-3xl mx-auto">
            {t('hero.title')}
          </h1>
          <p className="text-base text-slate-600 mt-3 text-center max-w-2xl mx-auto">{t('hero.subtitle')}</p>

          {/* TODO: trust strip — pending real stats endpoint */}

          <p className="text-xs uppercase tracking-wide text-slate-500 mt-8 text-center">
            {t('hero.pickerEyebrow')}
          </p>

          <div id="vehicle-picker" className="mt-3 max-w-2xl mx-auto">
            <VehiclePicker presetMakeSlug={presetMake} />
          </div>

          <a
            href="#browse-categories"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('browse-categories')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-3 block text-center text-sm text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
          >
            {t('hero.browseCategoriesLink')}
          </a>
        </div>
      </section>

      <HowItWorks />

      <div id="browse-categories">
        <CategoryTileGrid />
      </div>

      <section className="container mx-auto px-4 py-12">
        <PopularMakes onSelect={setPresetMake} />
      </section>

      <SellerHomeCta />
    </main>
  );
}
