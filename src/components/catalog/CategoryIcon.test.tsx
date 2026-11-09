import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CategoryIcon } from './CategoryIcon';

function iconClassOf(slug: string | null): string {
  const { container } = render(<CategoryIcon slug={slug} />);
  const svg = container.querySelector('svg');
  expect(svg).not.toBeNull();
  return svg?.getAttribute('class') ?? '';
}

describe('CategoryIcon', () => {
  it.each([
    ['maintenance', 'lucide-wrench'],
    ['brakes', 'lucide-disc'],
    ['suspension', 'lucide-activity'],
    ['engine', 'lucide-cog'],
    ['cooling', 'lucide-thermometer'],
    ['electrical', 'lucide-zap'],
    ['body', 'lucide-car'],
    ['interior', 'lucide-armchair'],
    ['transmission', 'lucide-settings'],
    ['exhaust-system', 'lucide-wind'],
    ['hvac', 'lucide-air-vent'],
  ])('maps the %s root to %s', (slug, expected) => {
    expect(iconClassOf(slug)).toContain(expected);
  });

  it('gives a few seeded leaves their own icon', () => {
    expect(iconClassOf('oil-filters')).toContain('lucide-filter');
    expect(iconClassOf('wheel-bearings')).toContain('lucide-life-buoy');
    expect(iconClassOf('tail-lights')).toContain('lucide-octagon');
    expect(iconClassOf('radiator-supports')).toContain('lucide-frame');
  });

  it('falls back to the package icon for unknown or missing slugs', () => {
    expect(iconClassOf('something-new')).toContain('lucide-package');
    expect(iconClassOf(null)).toContain('lucide-package');
  });

  it('passes svg props through', () => {
    const { container } = render(<CategoryIcon slug="brakes" className="h-4 w-4" aria-hidden />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('h-4 w-4');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
