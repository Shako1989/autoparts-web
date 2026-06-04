import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useCreateListing,
  useListing,
  useUpdateListing,
  type ListingCondition,
  type ListingStatus,
} from '@/api/listings';
import type { SearchHit } from '@/api/search';
import { PartPicker } from '@/components/seller/PartPicker';
import { PhotoUploader } from '@/components/seller/PhotoUploader';
import { FitmentPicker } from '@/components/seller/FitmentPicker';
import type { FitmentInput } from '@/api/listings';

interface Props {
  mode: 'create' | 'edit';
}

const CONDITIONS: ListingCondition[] = ['NEW', 'USED', 'REFURBISHED'];

export default function ListingEditorPage({ mode }: Props): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const isEdit = mode === 'edit';

  const existing = useListing(isEdit ? listingId : undefined);
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing(listingId ?? '');

  const [part, setPart] = useState<SearchHit | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('USED');
  const [priceMajor, setPriceMajor] = useState('');
  const [currency] = useState('AZN');
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<ListingStatus>('ACTIVE');
  const [fitments, setFitments] = useState<(FitmentInput & { label: string })[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (existing.data) {
      setTitle(existing.data.title);
      setDescription(existing.data.description ?? '');
      setCondition(existing.data.condition);
      setPriceMajor((existing.data.priceMinor / 100).toFixed(2));
      setQuantity(existing.data.quantity);
      setCity(existing.data.city ?? '');
      setStatus(existing.data.status);
      setPart({
        partId: existing.data.part.id,
        name: existing.data.part.name,
        brand: existing.data.part.brand,
        categorySlug: existing.data.part.categorySlug,
        defaultImageUrl: existing.data.part.defaultImageUrl,
        activeListings: 0,
        minPriceMinor: null,
        currency: null,
      });
    }
  }, [existing.data]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError(null);
    const priceMinor = Math.round(parseFloat(priceMajor.replace(',', '.')) * 100);
    if (!Number.isFinite(priceMinor) || priceMinor <= 0) {
      setSubmitError(t('listing.priceInvalid'));
      return;
    }
    try {
      if (isEdit && listingId) {
        await updateMutation.mutateAsync({
          title,
          description: description || undefined,
          condition,
          priceMinor,
          currency,
          quantity,
          city: city || undefined,
          status,
        });
      } else {
        if (!part) {
          setSubmitError(t('listing.partRequired'));
          return;
        }
        const created = await createMutation.mutateAsync({
          partId: part.partId,
          title,
          description: description || undefined,
          condition,
          priceMinor,
          currency,
          quantity,
          city: city || undefined,
          fitments: fitments.length > 0
            ? fitments.map(({ makeSlug, modelSlug, year }) => ({ makeSlug, modelSlug, year }))
            : undefined,
        });
        navigate(`/sell/listings/${created.id}`, { replace: true });
        return;
      }
      navigate('/sell');
    } catch (err) {
      setSubmitError(extractError(err));
    }
  }

  if (isEdit && existing.isLoading) return <Page>{t('catalog.loading')}</Page>;
  if (isEdit && (existing.isError || !existing.data)) return <Page>{t('catalog.empty')}</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-semibold">
        {isEdit ? t('listing.editTitle') : t('listing.createTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('listing.part')}</label>
              <div className="mt-1">
                <PartPicker
                  value={part}
                  onChange={(hit) => {
                    setPart(hit);
                    if (hit && title.length === 0) setTitle(hit.name);
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">{t('listing.titleField')}</label>
            <input
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">{t('listing.description')}</label>
            <textarea
              rows={4}
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('listing.condition')}</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {t(`listing.condition.${c}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('listing.quantity')}</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('listing.price')} ({currency})</label>
              <input
                type="text"
                inputMode="decimal"
                value={priceMajor}
                onChange={(e) => setPriceMajor(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="0.00"
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('listing.city')}</label>
              <input
                type="text"
                maxLength={80}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t('listing.compatibleVehicles')}
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                {t('listing.compatibleVehiclesHelp')}
              </p>
              <div className="mt-2">
                <FitmentPicker value={fitments} onChange={setFitments} />
              </div>
            </div>
          )}

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('listing.statusField')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="ACTIVE">{t('listing.status.ACTIVE')}</option>
                <option value="PAUSED">{t('listing.status.PAUSED')}</option>
                <option value="ARCHIVED">{t('listing.status.ARCHIVED')}</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isEdit ? t('listing.save') : t('listing.create')}
          </button>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </div>

        <aside>
          <h2 className="text-sm font-semibold text-slate-700">{t('listing.photos')}</h2>
          {isEdit && existing.data ? (
            <div className="mt-2">
              <PhotoUploader listingId={existing.data.id} photos={existing.data.photos} />
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">{t('listing.photosAfterCreate')}</p>
          )}
        </aside>
      </form>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }): ReactElement {
  return <main className="container mx-auto px-4 py-10">{children}</main>;
}

function extractError(err: unknown): string {
  if (typeof err === 'object' && err && 'response' in err) {
    const r = (err as { response?: { data?: { detail?: string; title?: string } } }).response;
    if (r?.data?.detail) return r.data.detail;
    if (r?.data?.title) return r.data.title;
  }
  return 'Something went wrong';
}
