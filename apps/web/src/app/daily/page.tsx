'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, BellOff, RefreshCw } from 'lucide-react';
import type { Profile } from '@cyberdestiny/shared';
import { buildDailyFortunePrompt, buildDailySubscribePrompt } from '@cyberdestiny/shared';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { FadeIn } from '@/components/ui/fade-in';
import { CopyPrompt } from '@/components/copy-prompt';

interface DailyFortune {
  date: string;
  summary: string;
  day_pillar?: string;
  profile_name?: string;
  report_id?: string;
  recommendations?: string[];
  practice_hint?: string[];
  branch_relations?: string[];
  classic?: { title: string; content: string };
  science?: { title: string; content: string };
  world_pulse?: string[];
  almanac?: { lunar_label: string; day_pillar: string; yi: string[]; ji: string[]; solar_term?: string };
  hexagram?: { primary?: string; changed?: string };
  deep_link?: string;
  source?: string;
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <Card className={accent ? 'border-water/25' : undefined}>
      <CardTitle className="mb-3">{title}</CardTitle>
      {children}
    </Card>
  );
}

export default function DailyPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState('');
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    apiGet<{ items: Profile[] }>('/profiles').then((d) => {
      setProfiles(d.items);
      if (d.items[0]) setProfileId(d.items[0].id);
    });
  }, []);

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    setLoading(true);
    apiGet<DailyFortune>('/push/daily?profile_id=' + profileId)
      .then((data) => {
        if (!cancelled) setFortune(data);
      })
      .catch((e) => {
        if (!cancelled) setMsg(e instanceof Error ? e.message : '加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const loadDaily = () => {
    if (!profileId) return;
    setLoading(true);
    apiGet<DailyFortune>('/push/daily?profile_id=' + profileId)
      .then(setFortune)
      .catch((e) => setMsg(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
  };

  const toggleSubscribe = async () => {
    if (!profileId) return;
    if (subscribed) {
      await apiPost('/push/unsubscribe', { profile_id: profileId });
      setSubscribed(false);
      setMsg('已关闭每日推送');
    } else {
      await apiPost('/push/subscribe', { profile_id: profileId, push_hour: 8 });
      setSubscribed(true);
      setMsg('已开启每日推送（早 8 点生成运势）');
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="今日运势"
        description="日柱交会 · 刑冲合害 · 典籍黄历 · 科学象意 · 时事脉搏"
      />

      <Card className="flex flex-wrap gap-3 items-center py-4">
        <Select
          className="flex-1 min-w-[200px]"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name ?? '未命名'}</option>
          ))}
        </Select>
        <Button onClick={loadDaily} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
        <Button onClick={toggleSubscribe} variant={subscribed ? 'outline' : 'accent'} className="gap-2">
          {subscribed ? <BellOff className="size-4" /> : <Bell className="size-4" />}
          {subscribed ? '关闭推送' : '订阅日运'}
        </Button>
      </Card>

      {msg && <Alert variant="success">{msg}</Alert>}

      {profileId && (
        <FadeIn>
          <Card className="space-y-3">
            <CardTitle className="text-base">Agent 一句话订阅</CardTitle>
            <p className="text-xs text-muted">复制到 Cursor / OpenClaw，由 Agent 代为订阅或拉取日运。</p>
            <CopyPrompt
              label="订阅每日推送"
              text={buildDailySubscribePrompt(profileId)}
            />
            <CopyPrompt
              label="立即获取今日运势"
              text={buildDailyFortunePrompt(profileId)}
            />
          </Card>
        </FadeIn>
      )}

      {loading && !fortune && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      )}

      {fortune && (
        <div className="space-y-4">
          <FadeIn>
            <Card className="space-y-4">
              <div className="flex flex-wrap justify-between gap-2 text-sm text-muted">
                <span>{fortune.date} · 日柱 {fortune.day_pillar}</span>
                {fortune.source && (
                  <Badge variant="default">{fortune.source === 'cache' ? '缓存' : '新生成'}</Badge>
                )}
              </div>
              <p className="text-lg md:text-xl leading-relaxed font-serif">{fortune.summary}</p>
              {fortune.report_id && (
                <Link
                  href={'/reports/' + fortune.report_id}
                  className="inline-flex text-sm text-water hover:underline transition-colors"
                >
                  查看完整报告 →
                </Link>
              )}
            </Card>
          </FadeIn>

          {fortune.branch_relations && fortune.branch_relations.length > 0 && (
            <FadeIn delay={60}>
              <Section title="刑冲合害">
                <ul className="text-sm space-y-1.5">
                  {fortune.branch_relations.map((b) => (
                    <li key={b} className="text-ink-soft">· {b}</li>
                  ))}
                </ul>
              </Section>
            </FadeIn>
          )}

          {fortune.almanac && (
            <FadeIn delay={80}>
              <Section title="黄历">
                <div className="text-sm space-y-2">
                  <p>{fortune.almanac.lunar_label} · {fortune.almanac.day_pillar}</p>
                  {fortune.almanac.solar_term && <p className="text-muted">{fortune.almanac.solar_term}</p>}
                  <p><Badge variant="wood" className="mr-2">宜</Badge>{fortune.almanac.yi.join(' · ')}</p>
                  <p><Badge variant="fire" className="mr-2">忌</Badge>{fortune.almanac.ji.join(' · ')}</p>
                </div>
              </Section>
            </FadeIn>
          )}

          {fortune.classic && (
            <FadeIn delay={100}>
              <Section title={'每日一典 · ' + fortune.classic.title}>
                <p className="text-sm leading-relaxed text-ink-soft">{fortune.classic.content}</p>
              </Section>
            </FadeIn>
          )}

          {fortune.science && (
            <FadeIn delay={120}>
              <Section title={'科学象意 · ' + fortune.science.title} accent>
                <p className="text-sm leading-relaxed text-ink-soft">{fortune.science.content}</p>
              </Section>
            </FadeIn>
          )}

          {fortune.world_pulse && fortune.world_pulse.length > 0 && (
            <FadeIn delay={140}>
              <Section title="时事脉搏">
                <ul className="text-sm space-y-2">
                  {fortune.world_pulse.map((line) => (
                    <li key={line} className="leading-relaxed text-ink-soft">· {line}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted mt-3">外部信息补充，请核验权威来源</p>
              </Section>
            </FadeIn>
          )}

          {fortune.hexagram?.primary && (
            <FadeIn delay={160}>
              <Section title="今日卦象">
                <p className="text-sm">
                  本卦 {fortune.hexagram.primary}
                  {fortune.hexagram.changed ? ' → 变卦 ' + fortune.hexagram.changed : ''}
                </p>
              </Section>
            </FadeIn>
          )}

          {fortune.recommendations && (
            <FadeIn delay={180}>
              <Section title="行动建议">
                <ul className="text-sm space-y-1.5">
                  {fortune.recommendations.map((r) => (
                    <li key={r} className="text-ink-soft">· {r}</li>
                  ))}
                </ul>
              </Section>
            </FadeIn>
          )}
        </div>
      )}
    </div>
  );
}
