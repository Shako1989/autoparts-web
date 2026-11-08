import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/api/client';
import i18n from '@/i18n';
import { HeroSearch } from './HeroSearch';

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname + loc.search}</div>;
}

function renderHero() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<><HeroSearch /><LocationProbe /></>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HeroSearch', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] } as AxiosResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens on the vehicle tab with the catalog picker', () => {
    renderHero();
    expect(screen.getByRole('tab', { name: /by vehicle/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Make')).toBeInTheDocument();
  });

  it('searches by part name and navigates to /search', () => {
    renderHero();
    fireEvent.click(screen.getByRole('tab', { name: /by part name/i }));
    const input = screen.getByPlaceholderText(/brake disc/i);
    fireEvent.change(input, { target: { value: 'brake pad' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByTestId('location')).toHaveTextContent('/search?q=brake%20pad');
  });

  it('keeps the search button disabled while the OEM field is empty', () => {
    renderHero();
    fireEvent.click(screen.getByRole('tab', { name: /by oem number/i }));
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });
});
