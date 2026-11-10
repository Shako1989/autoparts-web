/** `sedan` → `Sedan`, for catalog values stored lower-case. */
export function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatMoney(minorUnits: number, currency = 'AZN', locale = 'az-AZ'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minorUnits / 100);
}
