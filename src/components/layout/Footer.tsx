import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function Footer(): ReactElement {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-navy-line bg-navy">
      <div className="container mx-auto flex flex-col justify-between gap-2 px-4 py-6 text-sm text-slate-300 md:flex-row">
        <span>
          &copy; {year} {t('appName')}. {t('footer.rights')}
        </span>
        <span className="text-slate-500">{t('tagline')}</span>
      </div>
    </footer>
  );
}
