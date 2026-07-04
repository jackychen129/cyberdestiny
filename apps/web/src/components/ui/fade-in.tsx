'use client';

import { cn } from '@/lib/utils';

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn('animate-fade-in-up', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Stagger({
  children,
  className,
  baseDelay = 0,
  step = 60,
}: {
  children: React.ReactNode;
  className?: string;
  baseDelay?: number;
  step?: number;
}) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <FadeIn key={i} delay={baseDelay + i * step}>
              {child}
            </FadeIn>
          ))
        : children}
    </div>
  );
}
