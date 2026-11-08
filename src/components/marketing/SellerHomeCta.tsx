import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

export function SellerHomeCta(): ReactElement {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-6 rounded-2xl bg-navy p-8 text-center text-white sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t('seller.homeCtaTitle')}</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-300">{t('seller.homeCtaBody')}</p>
        </div>
        <Link
          to="/sell/onboarding"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <PlusCircle className="h-4 w-4" aria-hidden />
          {t('seller.homeCtaButton')}
        </Link>
      </div>
    </section>
  );
}
