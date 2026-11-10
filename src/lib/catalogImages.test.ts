import { describe, expect, it } from 'vitest';

import { categoryImageUrl, makeLogoUrl, vehicleImageUrl } from './catalogImages';

describe('catalogImages', () => {
  it('finds bundled category photos and make logos by slug', () => {
    expect(categoryImageUrl('maintenance')).toMatch(/maintenance/);
    expect(categoryImageUrl('no-such-category')).toBeUndefined();
    expect(makeLogoUrl('ford')).toMatch(/ford/);
    expect(makeLogoUrl('lada')).toBeUndefined();
  });

  it('prefers the generation render, the cutaway for the hero, and falls back to the photo', () => {
    expect(vehicleImageUrl('ford', 'fusion', 'CD391')).toMatch(/ford-fusion-cd391(?!-xray)/);
    expect(vehicleImageUrl('ford', 'fusion', 'CD391', 'xray')).toMatch(/ford-fusion-cd391-xray/);
    // No CD338 render yet: nothing for the sidebar, and the hero gets nothing rather than the wrong car.
    expect(vehicleImageUrl('ford', 'fusion', 'CD338')).toBeUndefined();
    expect(vehicleImageUrl('ford', 'fusion', 'CD338', 'xray')).toBeUndefined();
    expect(vehicleImageUrl('toyota', 'camry', null, 'xray')).toBeUndefined();
  });
});
