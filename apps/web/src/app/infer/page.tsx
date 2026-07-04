'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Profile, InferenceScope } from '@cyberdestiny/shared';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label, Input, Select } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { SegmentGroup } from '@/components/ui/segment';
import { Alert } from '@/components/ui/alert';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FadeIn } from '@/components/ui/fade-in';
import { InferenceChecklist } from '@/components/inference-checklist';
import {
  InferenceProgressOverlay,
  runInferWithProgress,
} from '@/components/inference-progress';
import { Sparkles } from 'lucide-react';

const SCOPES: { value: InferenceScope; label: string; note?: string }[] = [
  { value: 'day', label: '日运' },
  { value: 'week', label: '周运' },
  { value: 'year', label: '年运' },
  { value: 'lifetime', label: '一生' },
];

function InferWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get('profile');

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState(preselected ?? '');
  const [scope, setScope] = useState<InferenceScope>('day');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [booting, setBooting] = useState(true);

  const selectedProfile = profiles.find((p) => p.id === profileId) ?? null;

  useEffect(() => {
    apiGet<{ items: Profile[] }>('/profiles')
      .then((d) => {
        setProfiles(d.items);
        if (preselected) setProfileId(preselected);
        else if (d.items[0]) setProfileId(d.items[0].id);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : '档案加载失败'))
      .finally(() => setBooting(false));
  }, [preselected]);

  const handleInfer = async () => {
    if (!profileId) {
      setError('请选择档案');
      return;
    }
    setLoading(true);
    setFinishing(false);
    setError('');
    try {
      const result = await runInferWithProgress(() =>
        apiPost<{ report_id: string }>('/destiny_infer', {
          profile_id: profileId,
          scope,
          question: question || undefined,
        }),
      );
      setFinishing(true);
      await new Promise((r) => setTimeout(r, 650));
      router.push(`/reports/${result.report_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '推演失败');
      setLoading(false);
      setFinishing(false);
    }
  };

  if (booting) return <PageSkeleton />;

  return (
    <>
      <InferenceProgressOverlay active={loading} scope={scope} finishing={finishing} />

      <div className="space-y-8 max-w-2xl">
        <PageHeader
          title="推演工作台"
          description="选择档案与尺度，引擎计算命盘后生成结构化报告。"
        />

        {loadError && <Alert variant="error">{loadError}</Alert>}

        <div className="grid lg:grid-cols-5 gap-6">
          <FadeIn delay={80} className="lg:col-span-3">
            <Card className="space-y-6" glow>
              <div>
                <Label>选择档案</Label>
                <Select
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">— 请选择 —</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p.name ?? '匿名命主')} ({new Date(p.birth_datetime).toLocaleDateString('zh-CN')})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="mb-2">推演尺度</Label>
                <SegmentGroup value={scope} onChange={setScope} options={SCOPES} />
              </div>

              <div>
                <Label>关注议题（可选）</Label>
                <Input
                  placeholder="如今日整体运势、事业方向…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <Alert variant="error">{error}</Alert>}

              <Button
                onClick={handleInfer}
                disabled={loading}
                size="lg"
                className="w-full gap-2"
                data-testid="infer-submit"
              >
                {loading ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-paper/30 border-t-paper infer-loading-ring" />
                    推演中…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    发起推演
                  </>
                )}
              </Button>
            </Card>
          </FadeIn>

          <FadeIn delay={120} className="lg:col-span-2">
            <InferenceChecklist profile={selectedProfile} question={question} />
          </FadeIn>
        </div>
      </div>
    </>
  );
}

export default function InferPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InferWorkspace />
    </Suspense>
  );
}
