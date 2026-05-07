import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { CategoryTree } from '@/components/catalog/CategoryTree';
import { PopularMakes } from '@/components/catalog/PopularMakes';
import { VehiclePicker } from '@/components/catalog/VehiclePicker';

export default function HomePage(): ReactElement {
  const { t } = useTranslation();
  const [presetMake, setPresetMake] = useState<string | undefined>(undefined);

  return (
    <main className="container mx-auto px-4 py-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('hero.title')}</h1>
        <p className="mt-2 text-slate-600">{t('hero.subtitle')}</p>
      </section>

      <section className="mt-8 max-w-3xl">
        <VehiclePicker presetMakeSlug={presetMake} />
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PopularMakes onSelect={setPresetMake} />
        </div>
        <aside>
          <CategoryTree />
        </aside>
      </section>
    </main>
  );
}
