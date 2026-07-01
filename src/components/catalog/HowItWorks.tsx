import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

const STEPS = ['step1', 'step2', 'step3'] as const;

export function HowItWorks(): ReactElement {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="text-lg font-semibold">{t('howItWorks.title')}</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex flex-col items-start gap-2">
            <div className="rounded-full bg-slate-900 text-white h-8 w-8 flex items-center justify-center">
              {idx + 1}
            </div>
            <div className="font-semibold text-slate-900">{t(`howItWorks.${step}.title`)}</div>
            <p className="text-sm text-slate-600">{t(`howItWorks.${step}.body`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
