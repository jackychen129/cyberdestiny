import { cn } from '@/lib/utils';

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('block text-sm font-medium text-ink-soft mb-1.5', className)} {...props}>
      {children}
    </label>
  );
}

const fieldClass =
  'w-full rounded-lg border border-border bg-white/80 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 transition-all duration-200 focus:border-accent/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,87,0.12)] outline-none';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClass, 'cursor-pointer', className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClass, 'min-h-[100px] resize-y', className)}
      {...props}
    />
  );
}
