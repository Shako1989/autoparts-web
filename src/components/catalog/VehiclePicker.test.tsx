import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/api/client';
import i18n from '@/i18n';
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

const ROUTES: Record<string, unknown> = {
  '/v1/catalog/makes': [FORD, BMW],
  '/v1/catalog/makes/ford/models': [FUSION],
  '/v1/catalog/makes/bmw/models': [THREE],
  '/v1/catalog/models/model-fusion/generations': [CD391],
  '/v1/catalog/models/model-3/generations': [F30, G20],
  '/v1/catalog/generations/gen-cd391/years': [2013, 2014, 2019, 2020],
  '/v1/catalog/generations/gen-f30/years': [2016],
};

function ok(data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as never };
}

function renderPicker() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <VehiclePicker />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function pick(index: number, value: string, optionName: string): Promise<void> {
  await screen.findByRole('option', { name: optionName });
  fireEvent.change(screen.getAllByRole('combobox')[index] as HTMLSelectElement, {
    target: { value },
  });
}

describe('VehiclePicker generation step', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('az');
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
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(await screen.findByRole('option', { name: '2019' })).toBeInTheDocument();
  });

  it('shows the generation dropdown and no label when a model has several generations', async () => {
    renderPicker();
    await pick(0, 'bmw', 'BMW');
    await pick(1, '3-series', '3 Series');

    expect(await screen.findByRole('option', { name: 'F30 (2012–2019)' })).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(4);
    expect(screen.queryByText(/^Nəsil:/)).not.toBeInTheDocument();
  });
});
