import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-ink/6 text-ink-soft border-ink/8',
  wood: 'bg-wood/10 text-wood border-wood/20',
  fire: 'bg-fire/10 text-fire border-fire/20',
  water: 'bg-water/10 text-water border-water/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
};

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
