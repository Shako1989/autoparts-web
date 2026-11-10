import { useMemo, useRef, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { usePartsForVehicle, type PartListItem, type VehicleFilter } from '@/api/catalog';
import { usePartListingsSummaries, type PartListingStats } from '@/api/listings';
import { CategoryIcon } from '@/components/catalog/CategoryIcon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatMoney } from '@/lib/format';

const STRIP_SIZE = 12;

interface VehiclePartsStripProps {
  filter: VehicleFilter;
  /** "Ford Fusion 2015", for the heading. */
  vehicleLabel: string;
}

/**
 * Parts that fit the car, those with offers first, in a sideways-scrolling
 * row. Hidden entirely when the API has no such endpoint (older deploys).
 */
export function VehiclePartsStrip({ filter, vehicleLabel }: VehiclePartsStripProps): ReactElement | null {
  const { t } = useTranslation();
  const partsQ = usePartsForVehicle(filter, STRIP_SIZE);
  const items = useMemo(() => partsQ.data?.items ?? [], [partsQ.data]);
  const statsQ = usePartListingsSummaries(items.map((part) => part.id));
  const scroller = useRef<HTMLUListElement>(null);

  if (partsQ.isError) return null;

  const statsById = new Map((statsQ.data ?? []).map((stats) => [stats.partId, stats]));
  const ordered = [...items].sort((a, b) => offers(statsById, b) - offers(statsById, a));

  function scroll(direction: -1 | 1): void {
    const el = scroller.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  return (
    <section className="mt-10">
      <SectionHeading
        accent
        title={t('catalog.vehicle.popularParts', { vehicle: vehicleLabel })}
        action={
          ordered.length > 0 && (
            <div className="hidden gap-2 sm:flex">
              <ScrollButton direction={-1} label={t('catalog.vehicle.scrollBack')} onClick={() => scroll(-1)} />
              <ScrollButton direction={1} label={t('catalog.vehicle.scrollForward')} onClick={() => scroll(1)} />
            </div>
          )
        }
      />

      {partsQ.isLoading && (
        <ul className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, idx) => (
            <li key={idx} className="h-60 w-[200px] shrink-0 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </ul>
      )}

      {partsQ.data && ordered.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {t('catalog.vehicle.partsEmpty')}
        </p>
      )}

      {ordered.length > 0 && (
        <ul
          ref={scroller}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        >
          {ordered.map((part) => (
            <li key={part.id} className="w-[200px] shrink-0 snap-start">
              <PartCard part={part} stats={statsById.get(part.id)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function offers(stats: Map<string, PartListingStats>, part: PartListItem): number {
  return stats.get(part.id)?.activeCount ?? 0;
}

function PartCard({ part, stats }: { part: PartListItem; stats: PartListingStats | undefined }): ReactElement {
  const { t } = useTranslation();
  const hasOffers = stats !== undefined && stats.activeCount > 0 && stats.minPriceMinor !== null;

  return (
    <Link
      to={`/p/${part.id}`}
      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-card transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <span className="flex aspect-[4/3] items-center justify-center rounded-lg bg-slate-50">
        {part.defaultImageUrl ? (
          <img src={part.defaultImageUrl} alt="" className="h-full w-full rounded-lg object-contain" />
        ) : (
          <CategoryIcon slug={part.categorySlug} className="h-10 w-10 text-slate-400" aria-hidden />
        )}
      </span>
      <span className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">{part.name}</span>
      {part.brand && <span className="mt-0.5 text-xs text-slate-500">{part.brand}</span>}
      <span className="mt-auto pt-2">
        {hasOffers ? (
          <span className="text-base font-bold text-brand">
            {t('catalog.vehicle.fromPrice', {
              price: formatMoney(stats.minPriceMinor as number, stats.currency ?? 'AZN'),
            })}
          </span>
        ) : (
          <span className="text-sm font-medium text-slate-400">{t('part.noOffersYet')}</span>
        )}
      </span>
    </Link>
  );
}

function ScrollButton({
  direction,
  label,
  onClick,
}: {
  direction: -1 | 1;
  label: string;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-card transition-colors hover:border-brand hover:text-brand"
    >
      {direction < 0 ? (
        <ChevronLeft className="h-5 w-5" aria-hidden />
      ) : (
        <ChevronRight className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
