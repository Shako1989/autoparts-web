import { useState, type FormEvent, type ReactElement } from 'react';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useVinLookup, type VehicleVariant, type VinLookupResponse } from '@/api/catalog';
import { Button } from '@/components/ui/Button';
import { isValidVin, normalizeVin } from '@/lib/vin';
import { useGarageStore } from '@/store/garageStore';

interface VinLookupProps {
  /** Called when only the make matched, so a surrounding picker can preselect it. */
  onMakeResolved?: (makeSlug: string) => void;
  /** When provided, replaces the navigation to /v/... once a vehicle is resolved. */
  onPicked?: (vehicle: { makeSlug: string; modelSlug: string; year: number }) => void;
}

type ErrorKind = 'invalid' | 'unavailable' | 'failed';

/**
 * "Find by VIN" row. Decodes through GET /v1/catalog/vin/{vin} and acts on the
 * match status: EXACT goes straight to the vehicle page, AMBIGUOUS lists the
 * candidate versions, everything else explains what was recognised and leaves
 * the manual picker as the fallback.
 */
export function VinLookup({ onMakeResolved, onPicked }: VinLookupProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addVehicle = useGarageStore((s) => s.add);
  const lookup = useVinLookup();

  const [vin, setVin] = useState('');
  const [error, setError] = useState<ErrorKind | null>(null);
  const [result, setResult] = useState<VinLookupResponse | null>(null);

  function resolve(r: VinLookupResponse, variant?: VehicleVariant): void {
    const { make, model, generation } = r.match;
    const year = r.decoded.year;
    if (!make || !model || !year) return;

    const variantId = generation
      ? `${make.slug}-${model.slug}-${generation.slug}-${year}`
      : `${make.slug}-${model.slug}-${year}`;
    const label = [make.name, model.name, generation?.code, year, variant?.trim]
      .filter((part) => part !== null && part !== undefined && part !== '')
      .join(' ');

    addVehicle({
      variantId,
      makeSlug: make.slug,
      modelSlug: model.slug,
      year,
      label,
      ...(generation ? { generationSlug: generation.slug, generationCode: generation.code } : {}),
    });

    if (onPicked) {
      onPicked({ makeSlug: make.slug, modelSlug: model.slug, year });
    } else {
      navigate(`/v/${make.slug}/${model.slug}/${year}`);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setResult(null);
    const normalized = normalizeVin(vin);
    if (!isValidVin(normalized)) {
      setError('invalid');
      return;
    }
    setError(null);
    try {
      const r = await lookup.mutateAsync(normalized);
      const sole = r.match.variants[0];
      if (r.status === 'EXACT' && sole) {
        resolve(r, sole);
        return;
      }
      if (r.status === 'MAKE_ONLY' && r.match.make && onMakeResolved) {
        onMakeResolved(r.match.make.slug);
      }
      setResult(r);
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      setError(status === 400 ? 'invalid' : status === 503 ? 'unavailable' : 'failed');
    }
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">{t('catalog.vin.or')}</p>
      <form
        onSubmit={(e) => void submit(e)}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <label className="block flex-1 text-sm">
          <span className="mb-1 block text-slate-600">{t('catalog.vin.title')}</span>
          <input
            type="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={20}
            value={vin}
            onChange={(e) => {
              setVin(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder={t('catalog.vin.placeholder')}
            aria-invalid={error === 'invalid'}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono uppercase tracking-wide placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
          />
        </label>
        <Button type="submit" variant="secondary" disabled={lookup.isPending || vin.trim() === ''}>
          {lookup.isPending ? '…' : t('catalog.vin.find')}
        </Button>
      </form>
      <p className="mt-1 text-xs text-slate-500">{t('catalog.vin.hint')}</p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {t(`catalog.vin.errors.${error}`)}
        </p>
      )}
      {result && (
        <VinResult
          result={result}
          onPick={(variant) => resolve(result, variant)}
          onShowParts={() => resolve(result)}
        />
      )}
    </div>
  );
}

interface VinResultProps {
  result: VinLookupResponse;
  onPick: (variant: VehicleVariant) => void;
  onShowParts: () => void;
}

function VinResult({ result, onPick, onShowParts }: VinResultProps): ReactElement | null {
  const { t } = useTranslation();
  const vehicle = describeVehicle(result);

  switch (result.status) {
    case 'EXACT':
    case 'AMBIGUOUS':
      return (
        <div className="mt-3 text-sm">
          <p className="text-slate-700">{t('catalog.vin.ambiguous', { vehicle })}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {result.match.variants.map((variant) => (
              <li key={variant.id}>
                <button
                  type="button"
                  onClick={() => onPick(variant)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left hover:border-slate-500"
                >
                  {[
                    variant.trim,
                    variant.engineCode,
                    variant.bodyType,
                    variant.fuel ? t(`catalog.fuel.${variant.fuel}`) : null,
                  ]
                    .filter((part) => part !== null && part !== '')
                    .join(' · ')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'MODEL_ONLY':
      return (
        <div className="mt-3 text-sm">
          <p className="text-slate-700">{t('catalog.vin.modelOnly', { vehicle })}</p>
          <Button type="button" size="sm" className="mt-2" onClick={onShowParts}>
            {t('catalog.vin.showParts')}
          </Button>
        </div>
      );
    case 'MAKE_ONLY':
      return (
        <p className="mt-3 text-sm text-slate-700">{t('catalog.vin.makeOnly', { vehicle })}</p>
      );
    case 'NOT_IN_CATALOG':
      return (
        <p className="mt-3 text-sm text-slate-700">{t('catalog.vin.notInCatalog', { vehicle })}</p>
      );
    case 'NOT_DECODED':
      return <p className="mt-3 text-sm text-slate-700">{t('catalog.vin.notDecoded')}</p>;
    default:
      return null;
  }
}

/** "BMW 3 Series F30 2014 320i": catalog names when matched, vPIC's otherwise. */
function describeVehicle({ decoded, match }: VinLookupResponse): string {
  return [
    match.make?.name ?? decoded.make,
    match.model?.name ?? decoded.model,
    match.generation?.code,
    decoded.year,
    decoded.trim,
  ]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join(' ');
}
