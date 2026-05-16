import { type ReactElement } from 'react';
import { clsx } from 'clsx';

import type { Diagram, DiagramCallout } from '@/api/catalog';

interface Props {
  diagram: Diagram;
  selectedCalloutId: string | null;
  onSelect: (callout: DiagramCallout) => void;
}

export function DiagramViewer({ diagram, selectedCalloutId, onSelect }: Props): ReactElement {
  const { imageUrl, imageWidth, imageHeight, callouts, title } = diagram;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
      style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
    >
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
      <svg
        viewBox={`0 0 ${imageWidth} ${imageHeight}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-label={title}
      >
        {[...callouts]
          .sort((a, b) => a.zOrder - b.zOrder)
          .map((c) => {
            const isSelected = c.id === selectedCalloutId;
            const radius = Math.max(14, Math.min(imageWidth, imageHeight) * 0.018);
            return (
              <g
                key={c.id}
                className="cursor-pointer"
                onClick={() => onSelect(c)}
                tabIndex={0}
                role="button"
                aria-label={c.label}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(c);
                  }
                }}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={radius}
                  className={clsx(
                    'transition-colors',
                    isSelected
                      ? 'fill-amber-400 stroke-amber-700'
                      : 'fill-white stroke-slate-700 hover:fill-amber-100',
                  )}
                  strokeWidth={2}
                />
                <text
                  x={c.x}
                  y={c.y}
                  dy="0.35em"
                  textAnchor="middle"
                  className={clsx(
                    'select-none font-semibold',
                    isSelected ? 'fill-slate-900' : 'fill-slate-800',
                  )}
                  style={{ fontSize: radius * 1.1 }}
                >
                  {c.label}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
