'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CopyPrompt({
  label,
  text,
  hint,
  className,
}: {
  label: string;
  text: string;
  hint?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-ink/[0.02] p-3 space-y-2 transition-all duration-300',
        copied && 'copy-success-flash',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-sm font-medium transition-colors', copied && 'text-wood')}>
          {copied ? '已复制到剪贴板' : label}
        </p>
        <Button
          size="sm"
          variant={copied ? 'default' : 'outline'}
          className={cn('shrink-0 gap-1 h-8 transition-all', copied && 'bg-wood hover:bg-wood/90')}
          onClick={copy}
        >
          {copied ? (
            <Check className="size-3.5 motion-sparkle" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? '已复制' : '复制'}
        </Button>
      </div>
      {hint && <p className="text-xs text-muted leading-relaxed">{hint}</p>}
      <p
        className={cn(
          'text-xs text-ink-soft leading-relaxed font-mono bg-paper/80 rounded-lg p-2.5 border border-border/60 transition-all duration-300',
          copied && 'scale-[1.01] border-wood/25 bg-wood/5',
        )}
      >
        {text}
      </p>
    </div>
  );
}
