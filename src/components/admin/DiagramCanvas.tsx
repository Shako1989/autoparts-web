import { useRef, type MouseEvent, type ReactElement } from 'react';
import { clsx } from 'clsx';

import type { AdminCalloutEntry } from '@/api/admin';

interface Props {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  callouts: AdminCalloutEntry[];
  selectedCalloutId: string | null;
  addMode: boolean;
  onAddAt: (x: number, y: number) => void;
  onSelect: (calloutId: string) => void;
}

export function DiagramCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  callouts,
  selectedCalloutId,
  addMode,
  onAddAt,
  onSelect,
}: Props): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleClick(e: MouseEvent<HTMLDivElement>): void {
    if (!addMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    if (x < 0 || y < 0 || x > imageWidth || y > imageHeight) return;
    onAddAt(x, y);
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={clsx(
        'relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white',
        addMode ? 'cursor-crosshair' : 'cursor-default',
      )}
      style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
    >
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
        draggable={false}
      />
      <svg
        viewBox={`0 0 ${imageWidth} ${imageHeight}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {callouts.map((c) => {
          const isSelected = c.id === selectedCalloutId;
          const radius = Math.max(14, Math.min(imageWidth, imageHeight) * 0.018);
          return (
            <g
              key={c.id}
              onClick={(e) => { e.stopPropagation(); onSelect(c.id); }}
              className="cursor-pointer"
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
                className={clsx('select-none font-semibold', isSelected ? 'fill-slate-900' : 'fill-slate-800')}
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
