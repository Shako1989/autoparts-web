import { useState, type ReactElement } from 'react';

import { CategoryTileGrid } from '@/components/catalog/CategoryTileGrid';
import { HowItWorks } from '@/components/catalog/HowItWorks';
import { PopularMakes } from '@/components/catalog/PopularMakes';
import { HomeHero } from '@/components/marketing/HomeHero';
import { SellerHomeCta } from '@/components/marketing/SellerHomeCta';

export default function HomePage(): ReactElement {
  const [presetMake, setPresetMake] = useState<string | undefined>(undefined);

  return (
    <main className="bg-slate-50">
      <HomeHero presetMakeSlug={presetMake} />

      <section className="container mx-auto px-4 pt-10">
        <PopularMakes onSelect={setPresetMake} />
      </section>

      <div id="browse-categories">
        <CategoryTileGrid />
      </div>

      <HowItWorks />

      <SellerHomeCta />
    </main>
  );
}
