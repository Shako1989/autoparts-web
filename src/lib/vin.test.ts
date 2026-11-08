import { describe, expect, it } from 'vitest';
import { isValidVin, normalizeVin } from './vin';

describe('vin helpers', () => {
  it('normalises case, whitespace and dashes', () => {
    expect(normalizeVin(' 3fa6p0lu4kr-123 456 ')).toBe('3FA6P0LU4KR123456');
  });

  it('accepts a full VIN and a VIN with masked check digit and serial', () => {
    expect(isValidVin('3FA6P0LU4KR123456')).toBe(true);
    expect(isValidVin('3FA6P0LU*KR******')).toBe(true);
  });

  it('rejects wrong length, forbidden letters and wildcards in the attribute section', () => {
    expect(isValidVin('ABC')).toBe(false);
    expect(isValidVin('3FA6P0LU4KR12345I')).toBe(false);
    expect(isValidVin('3FA6P0L*4KR123456')).toBe(false);
  });
});
