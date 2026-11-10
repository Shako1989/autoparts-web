import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
const CD338 = {
  ...CD391,
  id: 'gen-cd338',
  code: 'CD338',
  name: 'Fusion I (CD338)',
  slug: 'cd338',
  yearFrom: 2006,
  yearTo: 2012,
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
const OIL_FILTERS = {
  id: 'cat-oil-filters',
  parentId: 'cat-maintenance',
  slug: 'oil-filters',
  name: 'Yağ filtrləri',
  iconUrl: null,
  sortOrder: 10,
  children: [],
};
const MAINTENANCE = {
  id: 'cat-maintenance',
  parentId: null,
  slug: 'maintenance',
  name: 'Texniki xidmət',
  iconUrl: null,
  sortOrder: 10,
  children: [OIL_FILTERS],
};
const HVAC = { ...MAINTENANCE, id: 'cat-hvac', slug: 'hvac', name: 'Kondisioner', sortOrder: 110, children: [] };
const OIL_FILTER = {
  id: 'part-oil-filter',
  categorySlug: 'oil-filters',
  name: 'Yağ filtri',
  brand: 'Motorcraft',
  defaultImageUrl: null,
};
const WIPER = { ...OIL_FILTER, id: 'part-wiper', categorySlug: 'wiper-blades', name: 'Silgəc' };

const EXACT = 'make=ford&model=fusion&year=2017&variant=var-se-20';
const MODEL_YEAR = 'make=ford&model=fusion&year=2017';

const ROUTES: Record<string, unknown> = {
  '/v1/catalog/makes': [FORD],
  '/v1/catalog/makes/ford/models': [FUSION],
  '/v1/catalog/models/model-fusion/generations': [CD338, CD391],
  '/v1/catalog/variants?model=model-fusion&year=2017': [S_25, SE_20],
  '/v1/catalog/categories': [MAINTENANCE, HVAC],
  [`/v1/catalog/categories/part-counts?${EXACT}`]: { 'cat-maintenance': 9, 'cat-oil-filters': 9 },
  [`/v1/catalog/categories/part-counts?${MODEL_YEAR}`]: {},
  // Newest first from the server; the strip moves the part with offers to the front.
  [`/v1/catalog/parts?page=0&size=12&${EXACT}`]: { items: [WIPER, OIL_FILTER], page: 0, size: 12, total: 2 },
  [`/v1/catalog/parts?page=0&size=12&${MODEL_YEAR}`]: { items: [], page: 0, size: 12, total: 0 },
  '/v1/parts/listings-summary?ids=part-wiper,part-oil-filter': [
    { partId: 'part-wiper', activeCount: 0, minPriceMinor: null, currency: null },
    { partId: 'part-oil-filter', activeCount: 2, minPriceMinor: 1850, currency: 'AZN' },
  ],
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

  it('falls back to the model year, naming the one generation built that year', async () => {
    renderAt('/v/ford/fusion/2017');

    await waitFor(() =>
      expect(useGarageStore.getState().activeVariantId).toBe('ford-fusion-gen-2017'),
    );
    expect(screen.getByText('CD391 · 2013–2020')).toBeInTheDocument();
    expect(screen.getAllByText('CD391').length).toBeGreaterThan(0);
    expect(useGarageStore.getState().vehicles[0]?.label).toBe('Ford Fusion CD391 2017');
    expect(useGarageStore.getState().vehicles[0]?.vehicleVariantId).toBeUndefined();
  });

  it('shows how many parts fit per category and the bundled category photo', async () => {
    renderAt('/v/ford/fusion/2017?variant=var-se-20');

    const maintenance = await screen.findByRole('link', { name: /Texniki xidmət/ });
    expect(maintenance).toHaveTextContent('9 hissə');
    expect(maintenance.querySelector('img')?.getAttribute('src')).toMatch(/maintenance/);
    expect(screen.getByRole('link', { name: /Kondisioner/ })).toHaveTextContent('Hələ hissə yoxdur');

    fireEvent.click(screen.getByRole('button', { name: 'Bütün kateqoriyalar' }));
    expect(screen.getByRole('link', { name: /Yağ filtrləri/ })).toHaveTextContent('9');
  });

  it('lists the parts that fit, offers first, with the lowest price', async () => {
    renderAt('/v/ford/fusion/2017?variant=var-se-20');

    // The price lands with the second request (listing stats), after the parts.
    expect(await screen.findByText(/18,50/)).toBeInTheDocument();
    const oilFilter = screen.getByRole('link', { name: /Yağ filtri/ });
    const wiper = screen.getByRole('link', { name: /Silgəc/ });
    expect(wiper).toHaveTextContent('Hələ təklif yoxdur');
    expect(oilFilter.compareDocumentPosition(wiper) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows the spec chips of the exact version and the facts in the sidebar', async () => {
    renderAt('/v/ford/fusion/2017?variant=var-se-20');

    // Once as a hero chip, once as a sidebar row.
    expect(await screen.findAllByText('Benzin')).toHaveLength(2);
    expect(screen.getAllByText('Sedan')).toHaveLength(2);
    expect(screen.getByText('Komplektasiya').nextElementSibling).toHaveTextContent('SE');
  });

  it('opens the picker from the hint when the link carries no exact version', async () => {
    renderAt('/v/ford/fusion/2017');

    const hints = await screen.findAllByRole('button', { name: 'Maşını dəyiş' });
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    fireEvent.click(hints[0]!);
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
    expect(screen.getByText('Bu maşın üçün hələ hissə əlavə olunmayıb.')).toBeInTheDocument();
  });
});
