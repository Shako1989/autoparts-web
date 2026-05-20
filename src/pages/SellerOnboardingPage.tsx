import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useBecomeSeller, useMySellerProfile } from '@/api/sellers';

export default function SellerOnboardingPage(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const existing = useMySellerProfile({ retry: false });
  const becomeSeller = useBecomeSeller();

  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [city, setCity] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (existing.data) {
    return (
      <main className="container mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-semibold">{t('seller.alreadyTitle')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('seller.alreadyHelper')}</p>
        <button
          type="button"
          onClick={() => navigate('/sell')}
          className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t('seller.dashboardCta')}
        </button>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError(null);
    try {
      await becomeSeller.mutateAsync({
        displayName: displayName.trim(),
        legalName: legalName.trim() || undefined,
        city: city.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      navigate('/sell', { replace: true });
    } catch (err) {
      setSubmitError(extractError(err));
    }
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold">{t('seller.onboardingTitle')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('seller.onboardingHelper')}</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label={t('seller.displayName')} value={displayName} setter={setDisplayName} required />
        <Field label={t('seller.legalName')} value={legalName} setter={setLegalName} />
        <Field label={t('seller.city')} value={city} setter={setCity} />
        <Field label={t('seller.contactPhone')} value={contactPhone} setter={setContactPhone} type="tel" />
        <Field label={t('seller.whatsapp')} value={whatsapp} setter={setWhatsapp} type="tel" />
        <div>
          <label className="block text-sm font-medium text-slate-700">{t('seller.bio')}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={becomeSeller.isPending || displayName.trim().length === 0}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {becomeSeller.isPending ? t('catalog.loading') : t('seller.submit')}
        </button>
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  setter,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  setter: (v: string) => void;
  type?: string;
  required?: boolean;
}): ReactElement {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => setter(e.target.value)}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}

function extractError(err: unknown): string {
  if (typeof err === 'object' && err && 'response' in err) {
    const r = (err as { response?: { data?: { detail?: string; title?: string } } }).response;
    if (r?.data?.detail) return r.data.detail;
    if (r?.data?.title) return r.data.title;
  }
  return 'Something went wrong';
}
