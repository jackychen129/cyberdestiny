'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, Download, Bookmark } from 'lucide-react';
import type { InferenceReport } from '@cyberdestiny/shared';
import { apiGet, apiPost } from '@/lib/api';
import { BaziChartVisual } from '@/components/bazi-chart-visual';
import { HexagramVisual } from '@/components/hexagram-visual';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FadeIn } from '@/components/ui/fade-in';
import { cn } from '@/lib/utils';

function BasisChain({ section }: { section: InferenceReport['sections'][0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-xs text-water hover:text-water/80 font-medium transition-colors"
      >
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
        {open ? '收起依据' : '查看依据链'} ({section.basis.length})
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <ul className="overflow-hidden text-xs text-muted space-y-1.5 pl-4 border-l-2 border-water/25">
          {section.basis.map((b) => (
            <li key={b}>
              <Badge className="mr-2 text-[10px] py-0">{section.basis_type}</Badge>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<InferenceReport | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    apiGet<InferenceReport>(`/reports/${id}`)
      .then(setReport)
      .catch(() => setError('报告加载失败'));
  }, [id]);

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!report) return <PageSkeleton />;

  return (
    <div className="space-y-10">
      <FadeIn>
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{scopeLabel(report.scope)}</Badge>
            <Badge>置信度 {(report.confidence * 100).toFixed(0)}%</Badge>
            {report.missing_inputs.length > 0 && (
              <Badge variant="fire">缺: {report.missing_inputs.join(', ')}</Badge>
            )}
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">推演报告</h1>
          <p className="text-lg leading-relaxed text-ink-soft">{report.summary}</p>
        </header>
      </FadeIn>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-medium border-b border-border pb-3">报告章节</h2>
        {report.sections.map((section, i) => (
          <FadeIn key={section.title} delay={i * 40}>
            <Card>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-soft mt-3">{section.content}</p>
              <BasisChain section={section} />
            </Card>
          </FadeIn>
        ))}
      </section>

      {report.recommendations.length > 0 && (
        <FadeIn>
          <Card>
            <CardTitle>行动建议</CardTitle>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-soft mt-3">
              {report.recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Card>
        </FadeIn>
      )}

      {report.practice_hint.length > 0 && (
        <FadeIn delay={40}>
          <Card>
            <CardTitle>修行提示</CardTitle>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-soft mt-3">
              {report.practice_hint.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Card>
        </FadeIn>
      )}

      {report.timeline && report.timeline.length > 0 && (
        <FadeIn delay={80}>
          <Card>
            <CardTitle>时间轴</CardTitle>
            <ul className="space-y-3 text-sm mt-4">
              {report.timeline.map((t, i) => {
                const item = t as { date?: string; label?: string; note?: string; tone?: string };
                return (
                  <li key={i} className="flex gap-4 border-l-2 border-border pl-4 py-1">
                    <span className="text-muted shrink-0 w-20">{item.date}</span>
                    <span className="text-ink-soft">{item.label}{item.note ? ` — ${item.note}` : ''}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </FadeIn>
      )}

      <div className="flex gap-3 flex-wrap">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/reports/${id}/export/markdown`}
          download
        >
          <Button variant="outline" className="gap-2">
            <Download className="size-4" />
            导出 Markdown
          </Button>
        </a>
        <Button
          variant="outline"
          className="gap-2"
          onClick={async () => {
            if (!report) return;
            await apiPost('/cases/snapshot', {
              profile_id: report.profile_id,
              report_id: report.report_id,
            });
            setSaved('已存入案例库');
          }}
        >
          <Bookmark className="size-4" />
          存入案例库
        </Button>
        {saved && <Alert variant="success" className="py-2 px-3">{saved}</Alert>}
      </div>

      {report.attached_artifacts?.bazi_chart && (
        <FadeIn>
          <Card>
            <CardTitle>命盘图</CardTitle>
            <div className="mt-4">
              <BaziChartVisual data={report.attached_artifacts.bazi_chart as Record<string, unknown>} />
            </div>
          </Card>
        </FadeIn>
      )}

      {report.attached_artifacts?.hexagram && (
        <FadeIn delay={40}>
          <Card>
            <CardTitle>卦象图</CardTitle>
            <div className="mt-4">
              <HexagramVisual
                primary={(report.attached_artifacts.hexagram as { primary_hexagram?: string }).primary_hexagram}
                changed={(report.attached_artifacts.hexagram as { changed_hexagram?: string }).changed_hexagram}
                lines={(report.attached_artifacts.hexagram as { lines?: { position: number; yin_yang: 'yin' | 'yang'; moving?: boolean }[] }).lines}
              />
            </div>
          </Card>
        </FadeIn>
      )}

      <footer className="text-xs text-muted border-t border-border pt-6 space-y-1">
        {report.cautions.map((c) => (
          <p key={c}>{c}</p>
        ))}
      </footer>
    </div>
  );
}

function scopeLabel(scope: string): string {
  const map: Record<string, string> = {
    day: '日运',
    week: '周运',
    year: '年运',
    lifetime: '一生格局',
  };
  return map[scope] ?? scope;
}
