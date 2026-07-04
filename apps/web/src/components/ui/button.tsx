'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  shine?: boolean;
};

const variants = {
  default: 'bg-ink text-paper hover:bg-ink/90 shadow-sm hover:shadow-md',
  accent: 'bg-accent text-white hover:bg-accent/90 shadow-sm hover:shadow-md',
  outline: 'border border-border-strong bg-white/60 hover:bg-white hover:border-ink/20',
  ghost: 'hover:bg-ink/5 text-ink-soft',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  shine = true,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple-effect';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
      onClick?.(e);
    },
    [onClick],
  );

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center font-medium transition-all duration-200 btn-ripple',
        shine && (variant === 'accent' || variant === 'default') && 'btn-shine',
        'active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        variants[variant],
        sizes[size],
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
