import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDevOtp, useRequestOtp, useVerifyOtp } from '@/api/auth';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const isDev = import.meta.env.DEV;

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('+994');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();
  const devOtp = useDevOtp(phone);

  const existingUser = !!useAuthStore.getState().user;

  async function handleRequest(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError(null);
    try {
      await requestOtp.mutateAsync({
        phone,
        email: email.trim() || undefined,
        purpose: existingUser ? 'LOGIN' : 'REGISTER',
      });
      setStep('code');
    } catch (err) {
      setSubmitError(extractError(err));
    }
  }

  async function handleVerify(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError(null);
    try {
      await verifyOtp.mutateAsync({ phone, code, fullName: fullName.trim() || undefined });
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(extractError(err));
    }
  }

  async function pullDevOtp(): Promise<void> {
    const { data } = await devOtp.refetch();
    if (data?.code) setCode(data.code);
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold">{t('auth.signIn')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('auth.helper')}</p>

      {step === 'phone' ? (
        <form onSubmit={handleRequest} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">{t('auth.phone')}</label>
            <PhoneInput value={phone} onChange={setPhone} className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">{t('auth.emailHelp')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('auth.fullName')} <span className="text-slate-400">({t('auth.optional')})</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={requestOtp.isPending || phone.length < 8 || !email.trim()}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {requestOtp.isPending ? t('catalog.loading') : t('auth.requestCode')}
          </button>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">
            {t('auth.codeSent', { email })}
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700">{t('auth.code')}</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-lg tracking-widest shadow-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={verifyOtp.isPending || code.length < 4}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {verifyOtp.isPending ? t('catalog.loading') : t('auth.verify')}
          </button>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="hover:underline"
            >
              {t('auth.changePhone')}
            </button>
            {isDev && (
              <button
                type="button"
                onClick={pullDevOtp}
                className="rounded bg-amber-100 px-2 py-1 font-medium text-amber-800 hover:bg-amber-200"
              >
                {t('auth.devFetchOtp')}
              </button>
            )}
          </div>
        </form>
      )}
    </main>
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
