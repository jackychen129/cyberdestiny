'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Flame } from 'lucide-react';
import type { Profile } from '@cyberdestiny/shared';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/fade-in';

export default function PracticePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState('');
  const [planId, setPlanId] = useState('');
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const [monthly, setMonthly] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    apiGet<{ items: Profile[] }>('/profiles').then((d) => {
      setProfiles(d.items);
      if (d.items[0]) setProfileId(d.items[0].id);
    });
  }, []);

  const start21 = async () => {
    const res = await apiPost<Record<string, unknown>>('/practice/start-21day', { profile_id: profileId });
    setPlanId(res.practice_plan_id as string);
    setPlan(res);
    setMsg('21 天修行径已创建');
  };

  const checkIn = async () => {
    if (!planId) return;
    await apiPost('/practice/check-in', { practice_plan_id: planId, duration_minutes: 15 });
    const updated = await apiGet<Record<string, unknown>>(`/practice/plans/${planId}`);
    setPlan(updated);
    setMsg('打卡成功');
  };

  const loadMonthly = async () => {
    const res = await apiGet<Record<string, unknown>>(`/practice/monthly-report/${profileId}`);
    setMonthly(res);
  };

  return (
    <div className="space-y-8 max-w-xl">
      <PageHeader
        title="修行中心"
        description="知命 → 认命 → 改命 · 21 天修行径与打卡"
      />

      <Card>
        <Select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name ?? '未命名'}</option>
          ))}
        </Select>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={start21} variant="accent" className="gap-2">
          <Flame className="size-4" />
          开启 21 天径
        </Button>
        <Button onClick={checkIn} disabled={!planId} variant="outline" className="gap-2">
          <CalendarCheck className="size-4" />
          今日打卡
        </Button>
        <Button onClick={loadMonthly} variant="outline">月度报告</Button>
      </div>

      {msg && <Alert variant="success">{msg}</Alert>}

      {plan && (
        <FadeIn>
          <Card>
            <CardTitle>功课计划</CardTitle>
            <div className="flex gap-2 mt-3">
              <Badge>{String(plan.period)}</Badge>
              <Badge variant="wood">{(plan.items as unknown[])?.length ?? 0} 项</Badge>
              <Badge variant="water">已打卡 {(plan.check_ins as unknown[])?.length ?? 0} 次</Badge>
            </div>
          </Card>
        </FadeIn>
      )}

      {monthly && (
        <FadeIn delay={80}>
          <Card className="text-sm space-y-2">
            <CardTitle>月度修行报告 · {String(monthly.month)}</CardTitle>
            <p className="text-ink-soft">打卡 {String(monthly.practice_check_ins)} 次 · {String(monthly.practice_minutes)} 分钟</p>
            <p className="text-ink-soft">推演 {String(monthly.inference_count)} 次</p>
            <p className="text-muted">{String(monthly.summary)}</p>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
