'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Calculator,
  FileText,
  GitBranch,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InferenceScope } from '@cyberdestiny/shared';

export const INFER_PROGRESS_STEPS = [
  { id: 'profile', label: '读取命理档案', detail: '载入出生时辰与地点', icon: User },
  { id: 'solar', label: '真太阳时校正', detail: '经度换算，校准时辰', icon: MapPin },
  { id: 'bazi', label: '四柱排盘演算', detail: '年月日时，五行定局', icon: Calculator },
  { id: 'rules', label: '刑冲合害分析', detail: '规则引擎深度演算', icon: GitBranch },
  { id: 'classic', label: '典籍象意检索', detail: '周易 · 子平 · 科学象意', icon: BookOpen },
  { id: 'report', label: '生成结构化报告', detail: '释象成文，可追溯依据', icon: FileText },
] as const;

const SCOPE_LABEL: Record<InferenceScope, string> = {
  day: '日运',
  week: '周运',
  year: '年运',
  lifetime: '一生格局',
};

const WUXING = ['木', '火', '土', '金', '水'];

export function InferenceProgressOverlay({
  active,
  scope,
  finishing,
}: {
  active: boolean;
  scope: InferenceScope;
  finishing?: boolean;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setStepIndex(0);
      return;
    }
    const t = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!active || finishing) return;
    const timer = setInterval(() => {
      setStepIndex((i) => (i < INFER_PROGRESS_STEPS.length - 2 ? i + 1 : i));
    }, 720);
    return () => clearInterval(timer);
  }, [active, finishing]);

  useEffect(() => {
    if (finishing) setStepIndex(INFER_PROGRESS_STEPS.length - 1);
  }, [finishing]);

  if (!visible) return null;

  const progress = finishing
    ? 100
    : Math.round(((stepIndex + 0.6) / INFER_PROGRESS_STEPS.length) * 100);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-ink/40 backdrop-blur-md transition-opacity duration-300',
        active ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      role="dialog"
      aria-modal="true"
      aria-label="推演进行中"
    >
      <div
        className={cn(
          'relative w-full max-w-lg rounded-2xl glass-panel p-6 md:p-8 shadow-lift',
          'motion-reveal-scale motion-reveal-visible infer-overlay-enter',
        )}
      >
        <div className="infer-orbit-ring" aria-hidden />

        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-accent">
              <Sparkles className="size-5 infer-sparkle-spin" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium">CyberDestiny Engine</span>
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-medium">
              正在推演 · {SCOPE_LABEL[scope]}
            </h2>
            <p className="text-sm text-muted">计算走引擎，释象走报告 — 请稍候</p>
          </div>

          <div className="infer-wuxing-track" aria-hidden>
            {WUXING.map((c, i) => (
              <span
                key={c}
                className="infer-wuxing-dot font-serif"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {c}
              </span>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>推演进度</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
              <div
                className="h-full rounded-full infer-progress-bar bg-gradient-to-r from-water via-accent to-wood"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="space-y-2">
            {INFER_PROGRESS_STEPS.map((step, i) => {
              const done = i < stepIndex || (finishing && i <= stepIndex);
              const current = i === stepIndex && !finishing;
              const pending = i > stepIndex && !finishing;
              const Icon = step.icon;

              return (
                <li
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all duration-500',
                    done && 'border-wood/25 bg-wood/5 infer-step-done',
                    current && 'border-accent/35 bg-accent/8 infer-step-active shadow-sm',
                    pending && 'border-border/60 bg-white/30 opacity-55',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                      done && 'bg-wood/15 text-wood',
                      current && 'bg-accent/15 text-accent infer-step-icon-pulse',
                      pending && 'bg-ink/5 text-muted',
                    )}
                  >
                    {done ? (
                      <span className="text-sm font-bold">✓</span>
                    ) : (
                      <Icon className={cn('size-4', current && 'infer-icon-spin')} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', current && 'text-ink')}>{step.label}</p>
                    <p className="text-xs text-muted truncate">{step.detail}</p>
                  </div>
                  {current && (
                    <span className="size-2 rounded-full bg-accent infer-pulse-dot shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** 等待推演动画至少展示若干步后再跳转报告 */
export async function runInferWithProgress<T>(
  inferFn: () => Promise<T>,
  opts: { minSteps?: number; stepMs?: number } = {},
): Promise<T> {
  const minSteps = opts.minSteps ?? 4;
  const stepMs = opts.stepMs ?? 720;
  const minMs = minSteps * stepMs;

  const [result] = await Promise.all([inferFn(), new Promise((r) => setTimeout(r, minMs))]);

  return result;
}
