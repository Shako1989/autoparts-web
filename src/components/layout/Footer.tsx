import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function Footer(): ReactElement {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="container mx-auto px-4 py-6 text-sm text-slate-600 flex flex-col md:flex-row justify-between gap-2">
        <span>
          &copy; {year} {t('appName')}. {t('footer.rights')}
        </span>
        <span className="text-slate-400">{t('tagline')}</span>
      </div>
    </footer>
  );
}
