'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function SegmentGroup<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; note?: string }[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const btn = btnRefs.current[value];
    const container = containerRef.current;
    if (!btn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setPill({ left: bRect.left - cRect.left, width: bRect.width });
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={cn('relative flex flex-wrap gap-2 p-1 rounded-xl bg-ink/[0.03] border border-border/60', className)}
      role="tablist"
    >
      <span
        className="segment-pill absolute top-1 bottom-1 rounded-lg bg-ink shadow-sm pointer-events-none"
        style={{ left: pill.left, width: pill.width }}
        aria-hidden
      />
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              btnRefs.current[opt.value] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
              active ? 'text-paper' : 'text-ink-soft hover:text-ink',
            )}
          >
            {opt.label}
            {opt.note && <span className="ml-1 text-xs opacity-60">({opt.note})</span>}
          </button>
        );
      })}
    </div>
  );
}
