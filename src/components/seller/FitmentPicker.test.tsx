import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/api/client';
import i18n from '@/i18n';
import { toFitmentInput, type FitmentRow } from '@/lib/fitments';
import { FitmentPicker } from './FitmentPicker';

const FORD = { id: 'make-ford', name: 'Ford', slug: 'ford', logoUrl: null, popularity: 50 };
const FUSION = { id: 'model-fusion', makeId: 'make-ford', name: 'Fusion', slug: 'fusion', yearFrom: 2013, yearTo: 2020 };
const CD391 = { id: 'gen-cd391', modelId: 'model-fusion', code: 'CD391', name: 'Fusion II', slug: 'gen', yearFrom: 2013, yearTo: 2020 };

function variant(id: string, trim: string, engineCode: string) {
  return { id, generationId: 'gen-cd391', modelId: 'model-fusion', year: 2017, trim, engineCode, bodyType: 'sedan', fuel: 'PETROL' };
}

const ROUTES: Record<string, unknown> = {
  '/v1/catalog/makes': [FORD],
  '/v1/catalog/makes/ford/models': [FUSION],
  '/v1/catalog/models/model-fusion/generations': [CD391],
  '/v1/catalog/generations/gen-cd391/years': [2016, 2017],
  '/v1/catalog/variants?generation=gen-cd391&year=2017': [
    variant('var-se-25', 'SE', '2.5 Duratec iVCT'),
    variant('var-se-20', 'SE', '2.0 EcoBoost'),
    variant('var-sport-27', 'Sport', '2.7 EcoBoost V6'),
  ],
};

function ok(data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as never };
}

function renderPicker(onChange: (rows: FitmentRow[]) => void, value: FitmentRow[] = []) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <FitmentPicker value={value} onChange={onChange} />
    </QueryClientProvider>,
  );
}

async function choose(label: string, value: string, optionName: string): Promise<void> {
  await screen.findByRole('option', { name: optionName });
  fireEvent.change(screen.getByRole('combobox', { name: label }), { target: { value } });
}

describe('FitmentPicker', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.spyOn(apiClient, 'get').mockImplementation(((url: string) =>
      url in ROUTES
        ? Promise.resolve(ok(ROUTES[url]))
        : Promise.reject(new Error(`unmocked ${url}`))) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds a rule for the whole model year when trim and engine are left blank', async () => {
    const onChange = vi.fn();
    renderPicker(onChange);
    await choose('Make', 'ford', 'Ford');
    await choose('Model', 'fusion', 'Fusion');
    await choose('Year', '2017', '2017');
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [rows] = onChange.mock.calls[0] as [FitmentRow[]];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      makeSlug: 'ford',
      modelSlug: 'fusion',
      generationSlug: 'gen',
      year: 2017,
      label: 'Ford Fusion CD391 2017',
    });
    expect(toFitmentInput(rows[0]!)).toEqual({ makeSlug: 'ford', modelSlug: 'fusion', year: 2017, generationSlug: 'gen' });
  });

  it('narrows the rule to the chosen trim and engine', async () => {
    const onChange = vi.fn();
    renderPicker(onChange);
    await choose('Make', 'ford', 'Ford');
    await choose('Model', 'fusion', 'Fusion');
    await choose('Year', '2017', '2017');
    await choose('Trim', 'SE', 'SE');
    fireEvent.change(screen.getByRole('combobox', { name: 'Engine' }), { target: { value: '2.0 EcoBoost' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    const [rows] = onChange.mock.calls[0] as [FitmentRow[]];
    expect(rows[0]).toMatchObject({
      trim: 'SE',
      engineCode: '2.0 EcoBoost',
      label: 'Ford Fusion CD391 2017 SE 2.0 EcoBoost',
    });
  });

  it('fills the engine in when the chosen trim has only one', async () => {
    const onChange = vi.fn();
    renderPicker(onChange);
    await choose('Make', 'ford', 'Ford');
    await choose('Model', 'fusion', 'Fusion');
    await choose('Year', '2017', '2017');
    await choose('Trim', 'Sport', 'Sport');

    expect(screen.getByRole('combobox', { name: 'Engine' })).toHaveValue('2.7 EcoBoost V6');
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const [rows] = onChange.mock.calls[0] as [FitmentRow[]];
    expect(rows[0]).toMatchObject({ trim: 'Sport', engineCode: '2.7 EcoBoost V6' });
  });

  it('does not add the same rule twice', async () => {
    const onChange = vi.fn();
    const existing: FitmentRow = {
      makeSlug: 'ford', modelSlug: 'fusion', generationSlug: 'gen', year: 2017, label: 'Ford Fusion CD391 2017',
    };
    renderPicker(onChange, [existing]);
    await choose('Make', 'ford', 'Ford');
    await choose('Model', 'fusion', 'Fusion');
    await choose('Year', '2017', '2017');
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
