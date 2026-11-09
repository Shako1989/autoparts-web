import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/api/client';
import type { VehicleVariant } from '@/api/catalog';
import i18n from '@/i18n';
import { useGarageStore } from '@/store/garageStore';
import { VehiclePicker } from './VehiclePicker';

const FORD = { id: 'make-ford', name: 'Ford', slug: 'ford', logoUrl: null, popularity: 50 };
const BMW = { id: 'make-bmw', name: 'BMW', slug: 'bmw', logoUrl: null, popularity: 90 };
const FUSION = {
  id: 'model-fusion',
  makeId: 'make-ford',
  name: 'Fusion',
  slug: 'fusion',
  yearFrom: 2013,
  yearTo: 2020,
};
const THREE = {
  id: 'model-3',
  makeId: 'make-bmw',
  name: '3 Series',
  slug: '3-series',
  yearFrom: 1990,
  yearTo: null,
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
const F30 = {
  id: 'gen-f30',
  modelId: 'model-3',
  code: 'F30',
  name: '3 Series F30',
  slug: 'f30',
  yearFrom: 2012,
  yearTo: 2019,
};
const G20 = {
  id: 'gen-g20',
  modelId: 'model-3',
  code: 'G20',
  name: '3 Series G20',
  slug: 'g20',
  yearFrom: 2019,
  yearTo: null,
};

function variant(id: string, trim: string, engineCode: string): VehicleVariant {
  return {
    id,
    generationId: 'gen-cd391',
    modelId: 'model-fusion',
    year: 2017,
    trim,
    engineCode,
    bodyType: 'sedan',
    fuel: 'PETROL',
  };
}

// MY2017 Fusion, as the API orders it (by trim): SE comes with three engines, Sport with one.
const FUSION_2017 = [
  variant('var-s-25', 'S', '2.5 Duratec iVCT'),
  variant('var-se-25', 'SE', '2.5 Duratec iVCT'),
  variant('var-se-15', 'SE', '1.5 EcoBoost'),
  variant('var-se-20', 'SE', '2.0 EcoBoost'),
  variant('var-sport-27', 'Sport', '2.7 EcoBoost V6'),
  variant('var-titanium-20', 'Titanium', '2.0 EcoBoost'),
];

const ROUTES: Record<string, unknown> = {
  '/v1/catalog/makes': [FORD, BMW],
  '/v1/catalog/makes/ford/models': [FUSION],
  '/v1/catalog/makes/bmw/models': [THREE],
  '/v1/catalog/models/model-fusion/generations': [CD391],
  '/v1/catalog/models/model-3/generations': [F30, G20],
  '/v1/catalog/generations/gen-cd391/years': [2013, 2014, 2017, 2019, 2020],
  '/v1/catalog/generations/gen-f30/years': [2016],
  '/v1/catalog/variants?generation=gen-cd391&year=2017': FUSION_2017,
};

function ok(data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as never };
}

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname + loc.search}</div>;
}

function renderPicker() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <VehiclePicker />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function select(index: number): HTMLSelectElement {
  return screen.getAllByRole('combobox')[index] as HTMLSelectElement;
}

function optionsOf(index: number): string[] {
  return within(select(index))
    .getAllByRole('option')
    .map((o) => o.textContent ?? '');
}

async function pick(index: number, value: string, optionName: string): Promise<void> {
  await screen.findByRole('option', { name: optionName });
  fireEvent.change(select(index), { target: { value } });
}

// Single generation, so the selects are: make, model, year, trim, engine.
async function pickFusion2017(): Promise<void> {
  await pick(0, 'ford', 'Ford');
  await pick(1, 'fusion', 'Fusion');
  await pick(2, '2017', '2017');
  await screen.findByRole('option', { name: 'Sport' });
}

describe('VehiclePicker', () => {
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

  it('names a sole generation under the selects instead of showing a dropdown', async () => {
    renderPicker();
    await pick(0, 'ford', 'Ford');
    await pick(1, 'fusion', 'Fusion');

    expect(
      await screen.findByText(
        i18n.t('catalog.vehiclePicker.generationLabel', { generation: 'CD391 (2013–2020)' }),
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(5);
    expect(await screen.findByRole('option', { name: '2019' })).toBeInTheDocument();
    // Trim and engine wait for a year.
    expect(select(3)).toBeDisabled();
    expect(select(4)).toBeDisabled();
  });

  it('shows the generation dropdown and no label when a model has several generations', async () => {
    renderPicker();
    await pick(0, 'bmw', 'BMW');
    await pick(1, '3-series', '3 Series');

    expect(await screen.findByRole('option', { name: 'F30 (2012–2019)' })).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(6);
    expect(screen.queryByText(/^Nəsil:/)).not.toBeInTheDocument();
  });

  it('offers the trims sold that year and fills in the engine when the trim has only one', async () => {
    renderPicker();
    await pickFusion2017();

    expect(optionsOf(3)).toEqual(['Hamısı', 'S', 'SE', 'Sport', 'Titanium']);
    await pick(3, 'Sport', 'Sport');

    expect(select(4)).toHaveValue('2.7 EcoBoost V6');
  });

  it('narrows the engines to the chosen trim and sends the exact version on Find', async () => {
    renderPicker();
    await pickFusion2017();
    await pick(3, 'SE', 'SE');

    expect(optionsOf(4)).toEqual(['Hamısı', '1.5 EcoBoost', '2.0 EcoBoost', '2.5 Duratec iVCT']);
    fireEvent.change(select(4), { target: { value: '2.0 EcoBoost' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));

    expect(screen.getByTestId('location').textContent).toBe('/v/ford/fusion/2017?variant=var-se-20');
    const garage = useGarageStore.getState();
    expect(garage.activeVariantId).toBe('ford-fusion-gen-2017-var-se-20');
    expect(garage.vehicles[0]).toMatchObject({
      vehicleVariantId: 'var-se-20',
      trim: 'SE',
      engineCode: '2.0 EcoBoost',
      generationCode: 'CD391',
      label: 'Ford Fusion CD391 2017 SE 2.0 EcoBoost',
    });
  });

  it('narrows the trims to the chosen engine when the engine is picked first', async () => {
    renderPicker();
    await pickFusion2017();
    fireEvent.change(select(4), { target: { value: '2.0 EcoBoost' } });

    expect(optionsOf(3)).toEqual(['Hamısı', 'SE', 'Titanium']);
    expect(select(3)).toHaveValue('');
  });

  it('still finds by model year alone when no trim or engine is chosen', async () => {
    renderPicker();
    await pickFusion2017();
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));

    expect(screen.getByTestId('location').textContent).toBe('/v/ford/fusion/2017');
    const garage = useGarageStore.getState();
    expect(garage.activeVariantId).toBe('ford-fusion-gen-2017');
    expect(garage.vehicles[0]?.label).toBe('Ford Fusion CD391 2017');
    expect(garage.vehicles[0]?.vehicleVariantId).toBeUndefined();
  });
});
