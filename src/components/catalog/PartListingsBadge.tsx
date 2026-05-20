import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { usePartListingsSummary } from '@/api/listings';
import { formatMoney } from '@/lib/format';

export function PartListingsBadge({ partId }: { partId: string }): ReactElement | null {
  const { t } = useTranslation();
  const { data, isLoading } = usePartListingsSummary(partId);

  if (isLoading) {
    return <span className="text-xs text-slate-400">{t('catalog.loading')}</span>;
  }
  if (!data || data.activeCount === 0) {
    return <span className="text-xs text-slate-500">{t('part.noOffersYet')}</span>;
  }
  return (
    <span className="text-xs font-medium text-emerald-700">
      {t('part.offersSummary', {
        count: data.activeCount,
        price: data.minPriceMinor != null && data.currency
          ? formatMoney(data.minPriceMinor, data.currency)
          : '—',
      })}
    </span>
  );
}
