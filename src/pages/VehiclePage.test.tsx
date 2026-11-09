import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/api/client';
import i18n from '@/i18n';
import { useGarageStore } from '@/store/garageStore';
import VehiclePage from './VehiclePage';

const FORD = { id: 'make-ford', name: 'Ford', slug: 'ford', logoUrl: null, popularity: 50 };
const FUSION = {
  id: 'model-fusion',
  makeId: 'make-ford',
  name: 'Fusion',
  slug: 'fusion',
  yearFrom: 2013,
  yearTo: 2020,
};
const CD391 = {
  id: 'gen-cd391',
  modelId: 'model-fusion',
  code: 'CD391',
  name: 'Fusion II (CD391)',
  slug: 'gen',
  yearFrom: 2013,
  yearTo: 2020,
};
const S_25 = {
  id: 'var-s-25',
  generationId: 'gen-cd391',
  modelId: 'model-fusion',
  year: 2017,
  trim: 'S',
  engineCode: '2.5 Duratec iVCT',
  bodyType: 'sedan',
  fuel: 'PETROL',
};
const SE_20 = { ...S_25, id: 'var-se-20', trim: 'SE', engineCode: '2.0 EcoBoost' };

const ROUTES: Record<string, unknown> = {
  '/v1/catalog/makes': [FORD],
  '/v1/catalog/makes/ford/models': [FUSION],
  '/v1/catalog/models/model-fusion/generations': [CD391],
  '/v1/catalog/variants?model=model-fusion&year=2017': [S_25, SE_20],
  '/v1/catalog/categories': [],
};

function ok(data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as never };
}

function renderAt(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/v/:makeSlug/:modelSlug/:year" element={<VehiclePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('VehiclePage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('az');
    useGarageStore.getState().clear();
    vi.spyOn(apiClient, 'get').mockImplementation(((url: string) =>
      url in ROUTES
        ? Promise.resolve(ok(ROUTES[url]))
        : Promise.reject(new Error(`unmocked ${url}`))) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('names the exact version from a deep link and makes it the active car', async () => {
    renderAt('/v/ford/fusion/2017?variant=var-se-20');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Ford Fusion 2017');
    expect(await screen.findByText('CD391 · SE · 2.0 EcoBoost')).toBeInTheDocument();
    await waitFor(() =>
      expect(useGarageStore.getState().activeVariantId).toBe('ford-fusion-gen-2017-var-se-20'),
    );
    expect(useGarageStore.getState().vehicles[0]).toMatchObject({
      label: 'Ford Fusion CD391 2017 SE 2.0 EcoBoost',
      vehicleVariantId: 'var-se-20',
      trim: 'SE',
      engineCode: '2.0 EcoBoost',
    });
  });

  it('keeps the car the picker just added instead of shadowing it with a copy', async () => {
    useGarageStore.getState().add({
      variantId: 'ford-fusion-gen-2017-var-se-20',
      makeSlug: 'ford',
      modelSlug: 'fusion',
      year: 2017,
      label: 'Ford Fusion CD391 2017 SE 2.0 EcoBoost',
      generationSlug: 'gen',
      generationCode: 'CD391',
      vehicleVariantId: 'var-se-20',
      trim: 'SE',
      engineCode: '2.0 EcoBoost',
    });
    renderAt('/v/ford/fusion/2017?variant=var-se-20');

    expect(await screen.findByText('CD391 · SE · 2.0 EcoBoost')).toBeInTheDocument();
    expect(useGarageStore.getState().vehicles).toHaveLength(1);
    expect(useGarageStore.getState().activeVariantId).toBe('ford-fusion-gen-2017-var-se-20');
  });

  it('falls back to the model year when the link carries no variant', async () => {
    renderAt('/v/ford/fusion/2017');

    await waitFor(() =>
      expect(useGarageStore.getState().activeVariantId).toBe('ford-fusion-gen-2017'),
    );
    expect(screen.getByText('CD391')).toBeInTheDocument();
    expect(useGarageStore.getState().vehicles[0]?.label).toBe('Ford Fusion CD391 2017');
    expect(useGarageStore.getState().vehicles[0]?.vehicleVariantId).toBeUndefined();
  });
});
