import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShoppingCart, Wrench } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header(): ReactElement {
  const { t } = useTranslation();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <Wrench className="h-5 w-5" aria-hidden />
          {t('appName')}
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm">
          <Link to="/search" className="hover:underline">{t('nav.search')}</Link>
          <Link to="/categories" className="hover:underline">{t('nav.categories')}</Link>
          <Link to="/by-car" className="hover:underline">{t('nav.byCar')}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/cart" className="inline-flex items-center gap-1 text-sm hover:underline">
            <ShoppingCart className="h-4 w-4" aria-hidden />
            <span>{t('nav.cart')}</span>
          </Link>
          <Link to="/login" className="text-sm hover:underline">{t('nav.login')}</Link>
        </div>
      </div>
    </header>
  );
}
