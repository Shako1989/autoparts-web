import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import type { Diagram, DiagramCallout } from '@/api/catalog';
import { DiagramViewer } from '@/components/catalog/DiagramViewer';
import { PartListingsBadge } from '@/components/catalog/PartListingsBadge';

export function DiagramBlock({ diagram }: { diagram: Diagram }): ReactElement {
  const sortedCallouts = useMemo(
    () =>
      [...diagram.callouts].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true }),
      ),
    [diagram.callouts],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sortedCallouts.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <DiagramViewer
        diagram={diagram}
        selectedCalloutId={selected?.id ?? null}
        onSelect={(c) => setSelectedId(c.id)}
      />
      <aside className="space-y-4">
        <CalloutList
          callouts={sortedCallouts}
          selectedId={selected?.id ?? null}
          onSelect={(c) => setSelectedId(c.id)}
        />
        {selected && <CalloutDetail callout={selected} />}
      </aside>
    </div>
  );
}

function CalloutList({
  callouts,
  selectedId,
  onSelect,
}: {
  callouts: DiagramCallout[];
  selectedId: string | null;
  onSelect: (c: DiagramCallout) => void;
}): ReactElement {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
        {t('catalog.diagram.partsList')}
      </div>
      <ul className="max-h-72 overflow-auto divide-y divide-slate-100">
        {callouts.map((c) => {
          const isSelected = c.id === selectedId;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                className={clsx(
                  'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                  isSelected ? 'bg-amber-50' : 'hover:bg-slate-50',
                )}
              >
                <span
                  className={clsx(
                    'flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs font-semibold',
                    isSelected
                      ? 'border-amber-700 bg-amber-400 text-slate-900'
                      : 'border-slate-300 bg-white text-slate-700',
                  )}
                >
                  {c.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-800">{c.part.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CalloutDetail({ callout }: { callout: DiagramCallout }): ReactElement {
  const { t } = useTranslation();
  const part = callout.part;
  const oem = part.partNumbers.filter((n) => n.type === 'OEM');
  const aftermarket = part.partNumbers.filter((n) => n.type === 'AFTERMARKET');

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded bg-slate-100">
          {part.defaultImageUrl ? (
            <img
              src={part.defaultImageUrl}
              alt=""
              className="h-full w-full rounded object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-500">{callout.label}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/p/${part.id}`} className="block font-medium text-slate-900 hover:underline">
            {part.name}
          </Link>
          {part.brand && <div className="text-xs text-slate-500">{part.brand}</div>}
          {callout.notes && <p className="mt-1 text-xs text-slate-500">{callout.notes}</p>}
        </div>
      </div>

      {oem.length > 0 && (
        <NumberGroup title={t('catalog.diagram.oem')} numbers={oem.map((n) => n.number)} />
      )}
      {aftermarket.length > 0 && (
        <NumberGroup
          title={t('catalog.diagram.aftermarket')}
          numbers={aftermarket.map((n) => (n.source ? `${n.source} · ${n.number}` : n.number))}
        />
      )}
      {part.partNumbers.length === 0 && (
        <p className="mt-3 text-xs text-slate-500">{t('catalog.diagram.noNumbers')}</p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <PartListingsBadge partId={part.id} />
        <Link
          to={`/p/${part.id}`}
          className="text-xs font-medium text-slate-700 hover:underline"
        >
          {t('part.viewOffers')}
        </Link>
      </div>
    </div>
  );
}

function NumberGroup({ title, numbers }: { title: string; numbers: string[] }): ReactElement {
  return (
    <div className="mt-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <ul className="mt-1 flex flex-wrap gap-1">
        {numbers.map((n) => (
          <li key={n} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
