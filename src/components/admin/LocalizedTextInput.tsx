import { useState, type ReactElement } from 'react';
import { clsx } from 'clsx';

interface Props {
  label: string;
  values: { az: string; ru: string; en: string };
  onChange: (next: { az: string; ru: string; en: string }) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
}

type Locale = 'az' | 'ru' | 'en';
const LOCALES: Locale[] = ['az', 'ru', 'en'];

export function LocalizedTextInput({
  label,
  values,
  onChange,
  required,
  multiline,
  rows = 3,
  maxLength,
}: Props): ReactElement {
  const [activeTab, setActiveTab] = useState<Locale>('en');

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
        <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-xs">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveTab(l)}
              className={clsx(
                'rounded px-2 py-0.5 uppercase transition-colors',
                activeTab === l ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1">
        {multiline ? (
          <textarea
            value={values[activeTab]}
            onChange={(e) => onChange({ ...values, [activeTab]: e.target.value })}
            rows={rows}
            maxLength={maxLength}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        ) : (
          <input
            type="text"
            value={values[activeTab]}
            onChange={(e) => onChange({ ...values, [activeTab]: e.target.value })}
            maxLength={maxLength}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}
