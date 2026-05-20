import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { useListing } from '@/api/listings';
import { PhotoCarousel } from '@/components/catalog/PhotoCarousel';
import { formatMoney } from '@/lib/format';

export default function ListingPage(): ReactElement {
  const { t } = useTranslation();
  const { listingId } = useParams<{ listingId: string }>();
  const { data, isLoading, isError } = useListing(listingId);

  if (isLoading) return <Page>{t('catalog.loading')}</Page>;
  if (isError || !data) return <Page>{t('catalog.empty')}</Page>;

  const waNumber = data.seller.whatsapp?.replace(/[^0-9+]/g, '');

  return (
    <Page>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article>
          {data.photos.length > 0 ? (
            <PhotoCarousel photos={data.photos} alt={data.title} />
          ) : data.part.defaultImageUrl ? (
            <img
              src={data.part.defaultImageUrl}
              alt=""
              className="aspect-[4/3] w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
              {t('listing.noPhoto')}
            </div>
          )}

          <h1 className="mt-4 text-2xl font-semibold">{data.title}</h1>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-slate-900">
              {formatMoney(data.priceMinor, data.currency)}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600">
              {t(`listing.condition.${data.condition}`)}
            </span>
          </div>
          {data.description && (
            <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{data.description}</p>
          )}

          <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-700">{t('listing.partInfo')}</h2>
            <Link to={`/p/${data.part.id}`} className="mt-1 block text-base font-medium text-slate-900 hover:underline">
              {data.part.name}
            </Link>
            {data.part.brand && <p className="text-xs text-slate-500">{data.part.brand}</p>}
          </div>
        </article>

        <aside>
          <div className="sticky top-4 space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">{t('listing.seller')}</h2>
              <p className="mt-1 font-medium text-slate-900">{data.seller.displayName}</p>
              {data.seller.city && <p className="text-xs text-slate-500">{data.seller.city}</p>}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {data.seller.contactPhone && (
                <a
                  href={`tel:${data.seller.contactPhone}`}
                  className="block rounded-md bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-800"
                >
                  {t('listing.callSeller')}
                </a>
              )}
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber.replace(/^\+/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md border border-emerald-600 px-4 py-2 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  {t('listing.whatsapp')}
                </a>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {t('listing.quantityAvailable', { count: data.quantity })}
            </p>
          </div>
        </aside>
      </div>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }): ReactElement {
  return <main className="container mx-auto px-4 py-10">{children}</main>;
}
