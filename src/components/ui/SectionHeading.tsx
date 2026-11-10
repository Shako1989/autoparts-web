import { type ReactElement, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  title: string;
  /** Optional right-aligned action, e.g. a "see all" link. */
  action?: ReactNode;
  /** Brand-red bar in front of the title, as on the vehicle page. */
  accent?: boolean;
}

export function SectionHeading({ title, action, accent }: SectionHeadingProps): ReactElement {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2
        className={cn(
          'text-xl font-bold tracking-tight text-slate-900 sm:text-2xl',
          accent && 'border-l-4 border-brand pl-3',
        )}
      >
        {title}
      </h2>
      {action}
    </div>
  );
}
