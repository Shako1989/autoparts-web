import { useState, type ReactElement } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  photos: { id: string; url: string }[];
  alt?: string;
}

export function PhotoCarousel({ photos, alt }: Props): ReactElement | null {
  const [index, setIndex] = useState(0);
  if (photos.length === 0) return null;
  const current = photos[Math.min(index, photos.length - 1)]!;

  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <img src={current.url} alt={alt ?? ''} className="h-full w-full object-contain" />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow ring-1 ring-slate-200 hover:bg-slate-100"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % photos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow ring-1 ring-slate-200 hover:bg-slate-100"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setIndex(i)}
              className={clsx(
                'h-16 w-16 overflow-hidden rounded border',
                i === index ? 'border-amber-500' : 'border-slate-200 hover:border-slate-400',
              )}
            >
              <img src={p.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
