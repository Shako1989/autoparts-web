import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import { useMyListings, type ListingStatus, type ListingSummary } from '@/api/listings';
import { formatMoney } from '@/lib/format';

const TABS: ListingStatus[] = ['ACTIVE', 'PAUSED', 'ARCHIVED'];

export default function SellerDashboardPage(): ReactElement {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ListingStatus>('ACTIVE');
  const { data, isLoading } = useMyListings(tab);

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('seller.dashboardTitle')}</h1>
        <Link
          to="/sell/listings/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t('seller.newListing')}
        </Link>
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(s)}
            className={clsx(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium',
              tab === s
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t(`listing.status.${s}`)}
          </button>
        ))}
      </div>

      <section className="mt-6">
        {isLoading && <p className="text-sm text-slate-500">{t('catalog.loading')}</p>}
        {data && data.items.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            {t('seller.noListings')}
          </p>
        )}
        {data && data.items.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function ListingCard({ listing }: { listing: ListingSummary }): ReactElement {
  const { t } = useTranslation();
  return (
    <Link
      to={`/sell/listings/${listing.id}`}
      className="block overflow-hidden rounded-md border border-slate-200 bg-white hover:border-slate-400"
    >
      <div className="aspect-[4/3] w-full bg-slate-100">
        {listing.thumbnailUrl ? (
          <img src={listing.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            {t('listing.noPhoto')}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="truncate font-medium text-slate-900">{listing.title}</div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-semibold">{formatMoney(listing.priceMinor, listing.currency)}</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600">
            {t(`listing.condition.${listing.condition}`)}
          </span>
        </div>
      </div>
    </Link>
  );
}
