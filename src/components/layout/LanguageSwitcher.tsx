import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGS = ['az', 'ru', 'en'] as const;

export function LanguageSwitcher(): ReactElement {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'az';

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <Globe className="h-4 w-4" aria-hidden />
      <select
        className="bg-transparent border border-slate-300 rounded px-2 py-1"
        value={current}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
        aria-label="Language"
      >
        {LANGS.map((l) => (
          <option key={l} value={l}>
            {t(`language.${l}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
