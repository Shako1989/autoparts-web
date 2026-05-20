import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { usePart, usePartFitments } from '@/api/catalog';
import { usePartListings, type ListingSummary } from '@/api/listings';
import { formatMoney } from '@/lib/format';

export default function PartPage(): ReactElement {
  const { t } = useTranslation();
  const { partId } = useParams<{ partId: string }>();
  const part = usePart(partId);
  const fitments = usePartFitments(partId);
  const offers = usePartListings(partId);

  if (part.isLoading) return <Page>{t('catalog.loading')}</Page>;
  if (part.isError || !part.data) return <Page>{t('catalog.empty')}</Page>;

  const oem = part.data.partNumbers.filter((n) => n.type === 'OEM');
  const aftermarket = part.data.partNumbers.filter((n) => n.type === 'AFTERMARKET');

  return (
    <Page>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <article>
          <Link to={`/c/${part.data.categorySlug}`} className="text-xs text-slate-500 hover:underline">
            {part.data.categorySlug}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{part.data.name}</h1>
          {part.data.brand && <p className="text-sm text-slate-500">{part.data.brand}</p>}

          {part.data.defaultImageUrl && (
            <img
              src={part.data.defaultImageUrl}
              alt=""
              className="mt-4 aspect-[4/3] w-full rounded-lg border border-slate-200 bg-white object-contain"
            />
          )}

          {part.data.description && (
            <p className="mt-4 text-sm text-slate-700">{part.data.description}</p>
          )}

          {oem.length > 0 && (
            <NumberGroup title={t('catalog.diagram.oem')} entries={oem} />
          )}
          {aftermarket.length > 0 && (
            <NumberGroup title={t('catalog.diagram.aftermarket')} entries={aftermarket} />
          )}

          {fitments.data && fitments.data.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">{t('part.fitments')}</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {fitments.data.map((f) => (
                  <li key={f.id}>
                    {f.makeName} {f.modelName} {f.year}
                    {f.trim ? ` · ${f.trim}` : ''}
                    {f.engineCode ? ` · ${f.engineCode}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside>
          <div className="sticky top-4 rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">{t('part.offersHeading')}</h2>
            {offers.isLoading && <p className="mt-2 text-sm text-slate-500">{t('catalog.loading')}</p>}
            {offers.data && offers.data.items.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">{t('part.noOffersYet')}</p>
            )}
            {offers.data && offers.data.items.length > 0 && (
              <ul className="mt-3 space-y-3">
                {offers.data.items.map((o) => (
                  <li key={o.id}>
                    <OfferCard offer={o} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </Page>
  );
}

function NumberGroup({
  title,
  entries,
}: {
  title: string;
  entries: { number: string; source: string | null }[];
}): ReactElement {
  return (
    <div className="mt-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <ul className="mt-1 flex flex-wrap gap-1">
        {entries.map((n) => (
          <li
            key={`${n.source ?? ''}-${n.number}`}
            className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800"
          >
            {n.source ? `${n.source} · ${n.number}` : n.number}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OfferCard({ offer }: { offer: ListingSummary }): ReactElement {
  const { t } = useTranslation();
  return (
    <Link
      to={`/listings/${offer.id}`}
      className="flex items-start gap-3 rounded-md border border-slate-200 p-2 hover:border-slate-400"
    >
      <div className="flex h-14 w-14 flex-none items-center justify-center rounded bg-slate-100">
        {offer.thumbnailUrl ? (
          <img src={offer.thumbnailUrl} alt="" className="h-full w-full rounded object-cover" />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-900">{offer.title}</div>
        <div className="mt-0.5 text-xs text-slate-500">
          {offer.sellerDisplayName ?? '—'}
          {offer.city ? ` · ${offer.city}` : ''}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold">{formatMoney(offer.priceMinor, offer.currency)}</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] uppercase text-slate-600">
            {t(`listing.condition.${offer.condition}`)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Page({ children }: { children: React.ReactNode }): ReactElement {
  return <main className="container mx-auto px-4 py-10">{children}</main>;
}
