import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function SellerHomeCta(): ReactElement {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="bg-slate-100 rounded-lg p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-center sm:text-left">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('seller.homeCtaTitle')}</h2>
          <p className="mt-1 text-sm text-slate-600 max-w-xl">{t('seller.homeCtaBody')}</p>
        </div>
        <Link
          to="/sell/onboarding"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-medium whitespace-nowrap"
        >
          {t('seller.homeCtaButton')}
        </Link>
      </div>
    </section>
  );
}
