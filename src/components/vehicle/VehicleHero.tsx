import { type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Car, ChevronRight, Home, Layers } from 'lucide-react';

import type { VehicleGeneration, VehicleMake, VehicleModel, VehicleVariant } from '@/api/catalog';
import heroBackground from '@/assets/hero/vehicle-waves.webp';
import bodyIcon from '@/assets/specs/body.webp';
import engineIcon from '@/assets/specs/engine.webp';
import fuelIcon from '@/assets/specs/fuel.webp';
import { makeLogoUrl } from '@/lib/catalogImages';
import { capitalise } from '@/lib/format';

interface VehicleHeroProps {
  make: VehicleMake;
  model: VehicleModel;
  year: number;
  generation?: VehicleGeneration;
  variant?: VehicleVariant;
  /** Car render for the right-hand side; hidden below `lg`. */
  imageUrl?: string;
  /** Opens the picker so the buyer can narrow to a trim and engine. */
  onChangeVehicle: () => void;
}

/**
 * Dark band at the top of the vehicle page: breadcrumbs, make badge, the
 * car's name and version, spec chips for what the catalog knows about the
 * variant, and the car render standing on the lit floor of the wave
 * backdrop, right-hand side.
 */
export function VehicleHero({
  make,
  model,
  year,
  generation,
  variant,
  imageUrl,
  onChangeVehicle,
}: VehicleHeroProps): ReactElement {
  const { t } = useTranslation();
  const version = [generation?.code, variant?.trim, variant?.engineCode]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join(' · ');
  const logo = make.logoUrl ?? makeLogoUrl(make.slug);
  const crumbs = [make.name, model.name, String(year)];

  const chips: { key: string; icon: ReactNode; label: string }[] = [];
  if (variant?.engineCode) {
    chips.push({ key: 'engine', icon: <SpecIcon src={engineIcon} />, label: variant.engineCode });
  }
  if (variant?.fuel) {
    chips.push({ key: 'fuel', icon: <SpecIcon src={fuelIcon} />, label: t(`catalog.fuel.${variant.fuel}`) });
  }
  if (variant?.bodyType) {
    chips.push({ key: 'body', icon: <SpecIcon src={bodyIcon} />, label: capitalise(variant.bodyType) });
  }
  if (!variant && generation) {
    chips.push({
      key: 'generation',
      icon: <Layers className="h-5 w-5" aria-hidden />,
      label: `${generation.code ?? generation.name} · ${generation.yearFrom}–${generation.yearTo ?? ''}`,
    });
  }

  return (
    <section className="relative flex min-h-[300px] flex-col justify-center overflow-hidden bg-navy text-white lg:min-h-[380px]">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      {/* Keeps the text readable on the left; fades out where the ribbons glow. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent" />
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 hidden h-[92%] w-[46%] max-w-[800px] object-contain object-right-bottom drop-shadow-[0_24px_32px_rgba(0,0,0,0.55)] lg:block"
        />
      )}

      <div className="container relative mx-auto w-full px-4 py-6 lg:py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-300">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="inline-flex items-center gap-1 hover:text-white">
                <Home className="h-4 w-4" aria-hidden />
                {t('catalog.vehicle.home')}
              </Link>
            </li>
            {crumbs.map((crumb, idx) => {
              const last = idx === crumbs.length - 1;
              return (
                <li key={idx} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                  <span className={last ? 'text-white' : undefined} aria-current={last ? 'page' : undefined}>
                    {crumb}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="lg:max-w-[56%]">
          <div className="mt-5 flex items-center gap-4">
            <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-white/95 p-2 shadow-hero">
              {logo ? (
                <img src={logo} alt={make.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <Car className="h-8 w-8 text-navy" aria-hidden />
              )}
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {t('catalog.vehicle.heading', { make: make.name, model: model.name, year })}
              </h1>
              {version && <p className="mt-1 text-base text-slate-300 sm:text-lg">{version}</p>}
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {chips.map((chip) => (
                <li
                  key={chip.key}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm"
                >
                  {chip.icon}
                  <span>{chip.label}</span>
                </li>
              ))}
            </ul>
          )}

          {!variant && (
            <p className="mt-4 text-sm text-slate-300">
              {t('catalog.vehicle.narrowHint')}{' '}
              <button
                type="button"
                onClick={onChangeVehicle}
                className="font-semibold text-white underline underline-offset-2 hover:text-brand"
              >
                {t('catalog.vehicle.changeVehicle')}
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SpecIcon({ src }: { src: string }): ReactElement {
  return <img src={src} alt="" aria-hidden className="h-5 w-5" />;
}
