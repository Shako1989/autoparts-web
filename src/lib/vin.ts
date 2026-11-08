/**
 * Client-side mirror of the API's VIN rule: 17 characters, digits and letters
 * except I, O and Q; '*' is accepted only where it loses nothing, the check
 * digit (position 9) and the serial number (positions 12–17).
 */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{8}[A-HJ-NPR-Z0-9*][A-HJ-NPR-Z0-9]{2}[A-HJ-NPR-Z0-9*]{6}$/;

export function normalizeVin(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase();
}

export function isValidVin(vin: string): boolean {
  return VIN_PATTERN.test(vin);
}
