'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '@cyberdestiny/shared';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label, Select } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Alert } from '@/components/ui/alert';
import { FadeIn } from '@/components/ui/fade-in';
import { Heart } from 'lucide-react';

export default function PairPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const [context, setContext] = useState<'general' | 'relationship' | 'business'>('general');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<{ items: Profile[] }>('/profiles').then((d) => {
      setProfiles(d.items);
      if (d.items[0]) setIdA(d.items[0].id);
      if (d.items[1]) setIdB(d.items[1].id);
    });
  }, []);

  const handlePair = async () => {
    if (!idA || !idB) {
      setError('请选择两个档案');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiPost<Record<string, unknown>>('/profiles/pair', {
        profile_id_a: idA,
        profile_id_b: idB,
        context,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : '合盘失败');
    } finally {
      setLoading(false);
    }
  };

  const score = result?.compatibility_score as number | undefined;

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="八字合盘"
        description="对比双方四柱，分析日主关系与地支互动。"
      />

      <FadeIn>
        <Card className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>甲方</Label>
              <Select value={idA} onChange={(e) => setIdA(e.target.value)}>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? '未命名'}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>乙方</Label>
              <Select value={idB} onChange={(e) => setIdB(e.target.value)}>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? '未命名'}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>场景</Label>
            <Select value={context} onChange={(e) => setContext(e.target.value as typeof context)}>
              <option value="general">综合</option>
              <option value="relationship">感情</option>
              <option value="business">合作</option>
            </Select>
          </div>
          {error && <Alert variant="error">{error}</Alert>}
          <Button onClick={handlePair} disabled={loading} className="w-full gap-2" variant="accent">
            <Heart className="size-4" />
            {loading ? '分析中…' : '开始合盘'}
          </Button>
        </Card>
      </FadeIn>

      {result && score != null && (
        <FadeIn delay={100}>
          <Card className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="relative flex size-20 items-center justify-center rounded-full border-4 border-accent/30"
                style={{
                  background: `conic-gradient(var(--color-accent) ${score}%, transparent ${score}%)`,
                }}
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-paper font-serif text-2xl font-medium">
                  {score}%
                </span>
              </div>
              <div>
                <p className="font-serif text-lg font-medium">契合度</p>
                <p className="text-sm text-muted mt-1">{result.day_master_relation as string}</p>
              </div>
            </div>
            {(result.branch_relations as string[])?.length > 0 && (
              <ul className="list-disc pl-5 text-sm text-ink-soft space-y-1">
                {(result.branch_relations as string[]).map((r) => <li key={r}>{r}</li>)}
              </ul>
            )}
            <div className="text-sm space-y-2">
              <p className="font-medium">优势</p>
              <ul className="list-disc pl-5 text-ink-soft space-y-1">
                {(result.strengths as string[]).map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
