/**
 * Photos and logos bundled with the app, looked up by slug. Drop a `.webp`
 * into src/assets/categories, src/assets/makes or src/assets/vehicles and it
 * is picked up here with a hashed URL; nothing else to register. A category
 * without a photo falls back to its lucide icon, a vehicle to the generic
 * X-ray car.
 */
const categoryFiles = import.meta.glob<string>('../assets/categories/*.webp', { eager: true, import: 'default' });
const makeFiles = import.meta.glob<string>('../assets/makes/*.webp', { eager: true, import: 'default' });
const vehicleFiles = import.meta.glob<string>('../assets/vehicles/*.webp', { eager: true, import: 'default' });

function byFileStem(files: Record<string, string>): Map<string, string> {
  const out = new Map<string, string>();
  for (const [path, url] of Object.entries(files)) {
    out.set(path.slice(path.lastIndexOf('/') + 1).replace(/\.webp$/, ''), url);
  }
  return out;
}

const categoryImages = byFileStem(categoryFiles);
const makeLogos = byFileStem(makeFiles);
const vehicleImages = byFileStem(vehicleFiles);

export function categoryImageUrl(slug: string): string | undefined {
  return categoryImages.get(slug);
}

export function makeLogoUrl(slug: string): string | undefined {
  return makeLogos.get(slug);
}

/** `ford-fusion-cd391.webp` for that generation, else `ford-fusion.webp` for the whole model. */
export function vehicleImageUrl(
  makeSlug: string,
  modelSlug: string,
  generationCode?: string | null,
): string | undefined {
  const model = `${makeSlug}-${modelSlug}`;
  const byGeneration = generationCode
    ? vehicleImages.get(`${model}-${generationCode.toLowerCase()}`)
    : undefined;
  return byGeneration ?? vehicleImages.get(model);
}
