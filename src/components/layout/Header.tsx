import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, ShoppingCart, Wrench } from 'lucide-react';

import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';

export function Header(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const [searchInput, setSearchInput] = useState('');

  const canSell = user?.role === 'SELLER' || user?.role === 'STAFF' || user?.role === 'ADMIN';
  const postListingTo = canSell ? '/sell/listings/new' : '/sell/onboarding';

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
    <header className="border-b border-navy-line bg-navy text-white">
      <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-3 lg:gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
            <Wrench className="h-5 w-5 text-white" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">{t('appName')}</span>
            <span className="hidden text-[11px] text-slate-400 sm:block">{t('tagline')}</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="order-3 w-full lg:order-2 lg:max-w-xl lg:flex-1">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('search.headerPlaceholder')}
              className="w-full rounded-lg border border-navy-line bg-white/10 px-3 py-2 pl-9 text-sm text-white placeholder:text-slate-400 focus:border-slate-400 focus:bg-white/15 focus:outline-none"
            />
          </div>
        </form>

        <div className="order-2 ml-auto flex items-center gap-3 lg:order-3">
          <LanguageSwitcher />
          <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-slate-200 hover:text-white">
            <ShoppingCart className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('nav.cart')}</span>
          </Link>
          {!user && (
            <Link to="/login" className="text-sm text-slate-200 hover:text-white">
              {t('nav.login')}
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-3 text-sm">
              {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                <Link to="/admin" className="text-slate-200 hover:text-white">
                  {t('nav.admin')}
                </Link>
              )}
              {canSell ? (
                <Link to="/sell" className="text-slate-200 hover:text-white">
                  {t('nav.mySellerPanel')}
                </Link>
              ) : (
                <Link to="/sell/onboarding" className="text-slate-200 hover:text-white">
                  {t('nav.becomeSeller')}
                </Link>
              )}
              <button type="button" onClick={handleSignOut} className="text-slate-400 hover:text-white">
                {t('nav.signOut')}
              </button>
            </div>
          )}
          <Link
            to={postListingTo}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('nav.postListing')}</span>
            <span className="sm:hidden">{t('nav.postListingShort')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
