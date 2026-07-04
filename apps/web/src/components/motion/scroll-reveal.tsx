'use client';

import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  const animClass = {
    up: 'motion-reveal-up',
    left: 'motion-reveal-left',
    right: 'motion-reveal-right',
    scale: 'motion-reveal-scale',
  }[direction];

  return (
    <div
      ref={ref}
      className={cn(animClass, inView && 'motion-reveal-visible', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
