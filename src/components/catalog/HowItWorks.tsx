import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

const STEPS = ['step1', 'step2', 'step3'] as const;

export function HowItWorks(): ReactElement {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">{t('howItWorks.title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex flex-col items-start gap-3">
            <div className="rounded-full bg-slate-900 text-white h-8 w-8 flex items-center justify-center text-sm font-semibold">
              {idx + 1}
            </div>
            <div>
              <div className="font-medium text-slate-900">{t(`howItWorks.${step}.title`)}</div>
              <div className="mt-1 text-sm text-slate-600">{t(`howItWorks.${step}.body`)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
