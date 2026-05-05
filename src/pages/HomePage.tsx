import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { getHealth } from '@/api/health';

type PingState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; status: string }
  | { kind: 'error'; message: string };

export default function HomePage(): ReactElement {
  const { t } = useTranslation();
  const [ping, setPing] = useState<PingState>({ kind: 'idle' });

  async function handlePing(): Promise<void> {
    setPing({ kind: 'loading' });
    try {
      const r = await getHealth();
      setPing({ kind: 'ok', status: r.status });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unknown error';
      setPing({ kind: 'error', message });
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <section className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {t('hero.title')}
        </h1>
        <p className="mt-3 text-slate-600">{t('hero.subtitle')}</p>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={() => void handlePing()} disabled={ping.kind === 'loading'}>
            {t('actions.pingApi')}
          </Button>
          {ping.kind === 'ok' && (
            <span className="text-sm text-emerald-700" role="status">
              ✓ API: {ping.status}
            </span>
          )}
          {ping.kind === 'error' && (
            <span className="text-sm text-red-700" role="alert">
              ✗ {ping.message}
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
