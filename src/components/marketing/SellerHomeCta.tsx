import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function SellerHomeCta(): ReactElement {
  const { t } = useTranslation();

  return (
    <section className="bg-slate-100">
      <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('seller.homeCtaTitle')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t('seller.homeCtaBody')}</p>
        </div>
        <Link
          to="/sell/onboarding"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 text-sm font-medium"
        >
          {t('seller.homeCtaButton')}
        </Link>
      </div>
    </section>
  );
}
