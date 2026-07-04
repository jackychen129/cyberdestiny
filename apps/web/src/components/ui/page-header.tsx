import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn('space-y-2 animate-fade-in-up', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">{title}</h1>
          {description && (
            <p className="text-muted text-sm md:text-base max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}
