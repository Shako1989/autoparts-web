import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, LayoutGrid, MapPin, MessageCircle } from 'lucide-react';

import { useCategoryTree, useMakes } from '@/api/catalog';
import { HeroSearch } from '@/components/marketing/HeroSearch';

interface HomeHeroProps {
  presetMakeSlug?: string;
}

/**
 * Dark hero: Baku skyline at sunset in the background, an X-ray car on the
 * right, headline + tabbed search card on the left, trust strip below.
 */
export function HomeHero({ presetMakeSlug }: HomeHeroProps): ReactElement {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* Background: skyline photo + gradients that keep the left side readable. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-[center_40%] bg-no-repeat"
        style={{ backgroundImage: "url('/hero/baku-sunset.webp')" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />

      {/* X-ray car, desktop only. */}
      <img
        src="/hero/car-xray.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-16 hidden w-[52%] max-w-[880px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] lg:block xl:-right-8"
      />

      <div className="container relative mx-auto px-4 pb-8 pt-10 sm:pt-14 lg:pb-10 lg:pt-16">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            {t('hero.titleLead')}{' '}
            <span className="text-brand">{t('hero.titleHighlight')}</span>{' '}
            {t('hero.titleTail')}
          </h1>
          <p className="mt-3 text-base text-slate-300 sm:text-lg">{t('hero.subtitle')}</p>
        </div>

        <div className="mt-6 lg:max-w-[62%]">
          <HeroSearch key={presetMakeSlug ?? '__none__'} presetMakeSlug={presetMakeSlug} />
        </div>

        <TrustStrip />
      </div>
    </section>
  );
}

function TrustStrip(): ReactElement {
  const { t } = useTranslation();
  const makes = useMakes();
  const categories = useCategoryTree();

  const makeCount = makes.data?.length;
  const categoryCount = categories.data?.length;

  const items = [
    {
      icon: Car,
      title: makeCount ? t('hero.stats.makes', { count: makeCount }) : t('hero.stats.makesFallback'),
      body: t('hero.stats.makesBody'),
    },
    {
      icon: LayoutGrid,
      title: categoryCount
        ? t('hero.stats.categories', { count: categoryCount })
        : t('hero.stats.categoriesFallback'),
      body: t('hero.stats.categoriesBody'),
    },
    { icon: MapPin, title: t('hero.stats.coverage'), body: t('hero.stats.coverageBody') },
    { icon: MessageCircle, title: t('hero.stats.contact'), body: t('hero.stats.contactBody') },
  ] as const;

  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-6 lg:grid-cols-4">
      {items.map(({ icon: Icon, title, body }) => (
        <li key={body} className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Icon className="h-5 w-5 text-white" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold leading-tight sm:text-lg">{title}</span>
            <span className="block text-xs text-slate-300 sm:text-sm">{body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
