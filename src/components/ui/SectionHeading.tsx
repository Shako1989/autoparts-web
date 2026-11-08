import { type ReactElement, type ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  /** Optional right-aligned action, e.g. a "see all" link. */
  action?: ReactNode;
}

export function SectionHeading({ title, action }: SectionHeadingProps): ReactElement {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}
