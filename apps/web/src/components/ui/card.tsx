'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function Card({
  className,
  hover = false,
  glow = false,
  tilt = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  glow?: boolean;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-2px)`;
  };

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = '';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        'rounded-xl glass-panel p-6',
        hover && 'glass-panel-hover cursor-default',
        glow && 'card-glow',
        tilt && 'card-tilt',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-serif text-lg font-medium tracking-tight text-ink', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted leading-relaxed mt-1', className)} {...props}>
      {children}
    </p>
  );
}
