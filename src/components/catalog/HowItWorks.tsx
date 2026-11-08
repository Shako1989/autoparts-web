import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { SectionHeading } from '@/components/ui/SectionHeading';

const STEPS = ['step1', 'step2', 'step3'] as const;

export function HowItWorks(): ReactElement {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-10">
      <SectionHeading title={t('howItWorks.title')} />
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STEPS.map((step, idx) => (
          <li
            key={step}
            className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {idx + 1}
            </span>
            <span>
              <span className="block font-semibold text-slate-900">{t(`howItWorks.${step}.title`)}</span>
              <span className="mt-1 block text-sm text-slate-600">{t(`howItWorks.${step}.body`)}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
