import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { VinLookupResponse } from '@/api/catalog';
import { apiClient } from '@/api/client';
import i18n from '@/i18n';
import { useGarageStore } from '@/store/garageStore';
import { VinLookup } from './VinLookup';

const FORD = { id: 'make-ford', name: 'Ford', slug: 'ford', logoUrl: null, popularity: 50 };
const FUSION = {
  id: 'model-fusion',
  makeId: 'make-ford',
  name: 'Fusion',
  slug: 'fusion',
  yearFrom: 2013,
  yearTo: 2020,
};
const GEN = {
  id: 'gen-fusion',
  modelId: 'model-fusion',
  code: null,
  name: 'Fusion',
  slug: 'gen',
  yearFrom: 2013,
  yearTo: 2020,
};
const SE_HYBRID = {
  id: 'v-hybrid',
  modelId: 'model-fusion',
  year: 2019,
  trim: 'SE Hybrid',
  engineCode: '2.0 Atkinson HEV',
  bodyType: 'sedan',
  fuel: 'HYBRID' as const,
};
const TITANIUM = {
  id: 'v-titanium',
  modelId: 'model-fusion',
  year: 2019,
  trim: 'Titanium',
  engineCode: '2.0 EcoBoost',
  bodyType: 'sedan',
  fuel: 'PETROL' as const,
};

function response(overrides: Partial<VinLookupResponse>): VinLookupResponse {
  return {
    vin: '3FA6P0LU4KR123456',
    status: 'EXACT',
    decoded: {
      make: 'FORD',
      model: 'Fusion',
      year: 2019,
      series: null,
      trim: 'SE Hybrid',
      bodyClass: 'Sedan/Saloon',
      vehicleType: 'PASSENGER CAR',
      driveType: null,
      engine: {
        displacementL: 2,
        cylinders: 4,
        horsepower: 188,
        engineModel: null,
        fuelPrimary: 'Gasoline',
        fuelSecondary: 'Electric',
        electrificationLevel: 'Strong HEV',
      },
      plantCountry: 'MEXICO',
      errorCode: '0',
      errorText: null,
    },
    match: {
      make: FORD,
      model: FUSION,
      generation: GEN,
      variants: [SE_HYBRID],
      fuel: 'HYBRID',
      bodyType: 'sedan',
    },
    ...overrides,
  };
}

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname + loc.search}</div>;
}

function ok(data: VinLookupResponse): AxiosResponse<VinLookupResponse> {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as never };
}

function renderVin(props: Parameters<typeof VinLookup>[0] = {}) {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<VinLookup {...props} />} />
          <Route
            path="/v/:makeSlug/:modelSlug/:year"
            element={
              <>
                <div>vehicle page</div>
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function typeAndSubmit(vin: string): void {
  fireEvent.change(screen.getByPlaceholderText(i18n.t('catalog.vin.placeholder')), {
    target: { value: vin },
  });
  fireEvent.click(screen.getByRole('button', { name: i18n.t('catalog.vin.find') }));
}

describe('VinLookup', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('az');
    useGarageStore.getState().clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('navigates to the vehicle page and stores the car on an exact match', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValueOnce(ok(response({})));

    renderVin();
    typeAndSubmit(' 3fa6p0lu4kr-123456 ');

    expect(await screen.findByText('vehicle page')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/v1/catalog/vin/3FA6P0LU4KR123456');
    const garage = useGarageStore.getState();
    expect(garage.vehicles).toHaveLength(1);
    expect(garage.vehicles[0]?.label).toBe('Ford Fusion 2019 SE Hybrid 2.0 Atkinson HEV');
    expect(garage.vehicles[0]?.vehicleVariantId).toBe('v-hybrid');
    expect(garage.activeVariantId).toBe('ford-fusion-gen-2019-v-hybrid');
    expect(screen.getByTestId('location')).toHaveTextContent('/v/ford/fusion/2019?variant=v-hybrid');
  });

  it('lists the candidates when ambiguous and navigates once one is picked', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce(
      ok(
        response({
          status: 'AMBIGUOUS',
          match: {
            make: FORD,
            model: FUSION,
            generation: GEN,
            variants: [SE_HYBRID, TITANIUM],
            fuel: null,
            bodyType: 'sedan',
          },
        }),
      ),
    );

    renderVin();
    typeAndSubmit('3FA6P0LU4KR123456');

    const titanium = await screen.findByRole('button', {
      name: /Titanium · 2\.0 EcoBoost · sedan/,
    });
    expect(screen.getByRole('button', { name: /SE Hybrid/ })).toBeInTheDocument();
    fireEvent.click(titanium);

    expect(await screen.findByText('vehicle page')).toBeInTheDocument();
    expect(useGarageStore.getState().vehicles[0]?.label).toBe('Ford Fusion 2019 Titanium 2.0 EcoBoost');
    expect(useGarageStore.getState().activeVariantId).toBe('ford-fusion-gen-2019-v-titanium');
  });

  it('rejects a malformed VIN locally without calling the API', () => {
    const get = vi.spyOn(apiClient, 'get');

    renderVin();
    typeAndSubmit('ABC');

    expect(screen.getByRole('alert')).toHaveTextContent(i18n.t('catalog.vin.errors.invalid'));
    expect(get).not.toHaveBeenCalled();
  });

  it('explains an undecodable VIN and leaves the user on the picker', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce(
      ok(
        response({
          status: 'NOT_DECODED',
          match: {
            make: null,
            model: null,
            generation: null,
            variants: [],
            fuel: null,
            bodyType: null,
          },
        }),
      ),
    );

    renderVin();
    typeAndSubmit('XTA217030F0123456');

    expect(await screen.findByText(i18n.t('catalog.vin.notDecoded'))).toBeInTheDocument();
    expect(screen.queryByText('vehicle page')).not.toBeInTheDocument();
  });

  it('preselects the make through the callback when only the make matched', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce(
      ok(
        response({
          status: 'MAKE_ONLY',
          decoded: { ...response({}).decoded, model: 'Ranger', trim: 'XLT' },
          match: {
            make: FORD,
            model: null,
            generation: null,
            variants: [],
            fuel: 'PETROL',
            bodyType: 'pickup',
          },
        }),
      ),
    );
    const onMakeResolved = vi.fn();

    renderVin({ onMakeResolved });
    typeAndSubmit('3FA6P0LU4KR123456');

    expect(
      await screen.findByText(i18n.t('catalog.vin.makeOnly', { vehicle: 'Ford Ranger 2019 XLT' })),
    ).toBeInTheDocument();
    expect(onMakeResolved).toHaveBeenCalledWith('ford');
  });

  it('shows the outage message when the decoder answers 503', async () => {
    const error = new AxiosError('Service Unavailable');
    error.response = { status: 503, data: {}, statusText: '', headers: {}, config: {} as never };
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(error);

    renderVin();
    typeAndSubmit('3FA6P0LU4KR123456');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      i18n.t('catalog.vin.errors.unavailable'),
    );
  });
});
