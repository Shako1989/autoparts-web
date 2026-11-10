import { type ReactElement } from 'react';

import type { CategoryNode } from '@/api/catalog';
import { CategoryIcon } from '@/components/catalog/CategoryIcon';
import { categoryImageUrl } from '@/lib/catalogImages';
import { cn } from '@/lib/cn';

interface CategoryArtworkProps {
  category: Pick<CategoryNode, 'slug' | 'iconUrl'>;
  /** Size of the artwork box, e.g. `h-14 w-14`. */
  className?: string;
  /** Size of the fallback lucide icon inside the box. */
  iconClassName?: string;
}

/**
 * A category's picture: the admin-uploaded icon if one is set, else the photo
 * bundled under src/assets/categories, else the lucide icon in a tinted box.
 * Meant to sit inside a `group` link so the fallback tints on hover.
 */
export function CategoryArtwork({
  category,
  className,
  iconClassName = 'h-7 w-7',
}: CategoryArtworkProps): ReactElement {
  const src = category.iconUrl ?? categoryImageUrl(category.slug);
  if (src) {
    return <img src={src} alt="" className={cn('shrink-0 object-contain', className)} />;
  }
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-slate-100 text-navy group-hover:bg-brand-soft group-hover:text-brand',
        className,
      )}
    >
      <CategoryIcon slug={category.slug} className={iconClassName} aria-hidden />
    </span>
  );
}
