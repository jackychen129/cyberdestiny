import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const variants = {
  error: {
    class: 'border-fire/25 bg-fire/5 text-fire',
    icon: AlertCircle,
  },
  success: {
    class: 'border-wood/25 bg-wood/5 text-wood',
    icon: CheckCircle2,
  },
  info: {
    class: 'border-water/25 bg-water/5 text-water',
    icon: Info,
  },
};

export function Alert({
  variant = 'info',
  className,
  children,
}: {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  const v = variants[variant];
  const Icon = v.icon;
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border px-4 py-3 text-sm animate-fade-in',
        v.class,
        className,
      )}
      role="alert"
    >
      <Icon className="size-4 shrink-0 mt-0.5 opacity-80" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
