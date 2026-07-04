'use client';

import { INFERENCE_FIELD_GUIDE } from '@cyberdestiny/shared';
import type { Profile } from '@cyberdestiny/shared';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function fieldStatus(profile: Profile | null, question?: string, key?: string): boolean {
  if (!profile) return false;
  switch (key) {
    case 'birth_datetime':
      return !!profile.birth_datetime;
    case 'birth_hour':
      return profile.birth_hour_known;
    case 'birth_place':
      return !!profile.birth_place?.trim();
    case 'gender':
      return profile.gender !== 'unknown';
    case 'current_location':
      return !!profile.current_location?.trim();
    case 'occupation':
      return !!profile.occupation?.trim();
    case 'question':
      return !!question?.trim();
    default:
      return false;
  }
}

export function InferenceChecklist({
  profile,
  question,
  className,
}: {
  profile: Profile | null;
  question?: string;
  className?: string;
}) {
  const done = INFERENCE_FIELD_GUIDE.filter((f) => fieldStatus(profile, question, f.key)).length;
  const total = INFERENCE_FIELD_GUIDE.length;

  return (
    <Card className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="text-base">推演信息完整度</CardTitle>
        <Badge variant={done >= 4 ? 'wood' : 'fire'}>
          {done}/{total}
        </Badge>
      </div>
      <p className="text-xs text-muted leading-relaxed">
        信息越完整，排盘与释象越精准。匿名推演仅保存一条档案，不存储姓名。
      </p>
      <ul className="space-y-2">
        {INFERENCE_FIELD_GUIDE.map((f) => {
          const ok = fieldStatus(profile, question, f.key);
          return (
            <li
              key={f.key}
              className={cn(
                'text-sm rounded-lg px-3 py-2 border transition-colors',
                ok ? 'border-wood/20 bg-wood/5' : 'border-border bg-white/40',
              )}
            >
              <div className="flex items-start gap-2">
                <span className={ok ? 'text-wood' : 'text-muted'}>{ok ? '✓' : '○'}</span>
                <div>
                  <span className="font-medium">{f.label}</span>
                  {f.required && !ok && (
                    <Badge variant="fire" className="ml-2 text-[10px] py-0">
                      建议补全
                    </Badge>
                  )}
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{f.impact}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
