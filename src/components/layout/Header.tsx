import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Wrench } from 'lucide-react';

import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';

export function Header(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const [searchInput, setSearchInput] = useState('');

  function handleSearch(e: FormEvent): void {
    e.preventDefault();
    const q = searchInput.trim();
    if (q.length === 0) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleSignOut(): void {
    clear();
    navigate('/');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-3 md:gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <Wrench className="h-5 w-5" aria-hidden />
          {t('appName')}
        </Link>

        <form onSubmit={handleSearch} className="order-3 w-full md:order-2 md:flex-1 md:max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('search.headerPlaceholder')}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </form>

        <div className="order-2 ml-auto flex items-center gap-3 md:order-3">
          <LanguageSwitcher />
          <Link to="/cart" className="inline-flex items-center gap-1 text-sm hover:underline">
            <ShoppingCart className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('nav.cart')}</span>
          </Link>
          {!user && (
            <Link to="/login" className="text-sm hover:underline">{t('nav.login')}</Link>
          )}
          {user && (
            <div className="flex items-center gap-3 text-sm">
              {user.role === 'SELLER' || user.role === 'STAFF' || user.role === 'ADMIN' ? (
                <Link to="/sell" className="hover:underline">{t('nav.mySellerPanel')}</Link>
              ) : (
                <Link to="/sell/onboarding" className="hover:underline">{t('nav.becomeSeller')}</Link>
              )}
              <button type="button" onClick={handleSignOut} className="text-slate-500 hover:underline">
                {t('nav.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
