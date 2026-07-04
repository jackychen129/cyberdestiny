'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, UserCircle } from 'lucide-react';
import type { Profile } from '@cyberdestiny/shared';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label, Input, Select } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FadeIn } from '@/components/ui/fade-in';
import { InferenceChecklist } from '@/components/inference-checklist';

function profileToForm(p: Profile | null) {
  if (!p) {
    return {
      birth_datetime: '',
      birth_place: '',
      current_location: '',
      occupation: '',
      gender: 'unknown' as const,
      birth_hour_known: true,
    };
  }
  const local = p.birth_datetime.slice(0, 16);
  return {
    birth_datetime: local,
    birth_place: p.birth_place ?? '',
    current_location: p.current_location ?? '',
    occupation: p.occupation ?? '',
    gender: p.gender,
    birth_hour_known: p.birth_hour_known,
  };
}

export default function ProfilesPage() {
  const { user, loading: authLoading } = useAuth();
  const isGuest = !user;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    birth_datetime: '',
    birth_place: '',
    current_location: '',
    occupation: '',
    gender: 'unknown' as 'male' | 'female' | 'unknown',
    birth_hour_known: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ items: Profile[] }>('/profiles');
      setProfiles(data.items);
      if (isGuest && data.items[0]) {
        setForm({ ...profileToForm(data.items[0]), name: '' });
      }
      setLoadError('');
    } catch (e) {
      setProfiles([]);
      setLoadError(e instanceof Error ? e.message : '档案加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, user]);

  const buildPayload = (includeName: boolean) => {
    const dt = form.birth_datetime.includes('T')
      ? `${form.birth_datetime}:00+08:00`
      : `${form.birth_datetime}T12:00:00+08:00`;
    return {
      ...(includeName && form.name ? { name: form.name } : {}),
      gender: form.gender,
      birth_datetime: dt,
      birth_place: form.birth_place || undefined,
      current_location: form.current_location || undefined,
      occupation: form.occupation || undefined,
      birth_hour_known: form.birth_hour_known,
    };
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await apiPost('/profiles', buildPayload(false));
      setMsg('档案已更新（匿名模式不保存姓名）');
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiPost('/profiles', buildPayload(true));
    setShowForm(false);
    setForm({
      name: '',
      birth_datetime: '',
      birth_place: '',
      current_location: '',
      occupation: '',
      gender: 'unknown',
      birth_hour_known: true,
    });
    load();
  };

  const guestProfile = isGuest ? profiles[0] ?? null : null;

  if (authLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div className="space-y-8">
      <PageHeader
        title={isGuest ? '匿名推演档案' : '命理档案'}
        description={
          isGuest
            ? '每个浏览器仅保留一条档案，不存储姓名。登录后可保存多个具名档案。'
            : '管理出生信息，供推演、合盘与日运使用。'
        }
      >
        {!isGuest && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'} className="gap-2">
            <Plus className="size-4" />
            {showForm ? '取消' : '新建档案'}
          </Button>
        )}
      </PageHeader>

      {loadError && <Alert variant="error">{loadError}</Alert>}
      {msg && <Alert variant={msg.includes('失败') ? 'error' : 'success'}>{msg}</Alert>}

      {isGuest ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <FadeIn>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <UserCircle className="size-5 text-muted" />
                <Badge>匿名命主</Badge>
                {guestProfile && <Badge variant="water">已保存</Badge>}
              </div>
              <form onSubmit={handleSaveGuest} className="space-y-4">
                <div>
                  <Label>出生日期时间</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={form.birth_datetime}
                    onChange={(e) => setForm({ ...form, birth_datetime: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.birth_hour_known}
                    onChange={(e) => setForm({ ...form, birth_hour_known: e.target.checked })}
                  />
                  出生时辰准确（取消勾选表示时辰不详）
                </label>
                <div>
                  <Label>出生地点</Label>
                  <Input
                    placeholder="如：四川成都"
                    value={form.birth_place}
                    onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
                  />
                </div>
                <div>
                  <Label>性别</Label>
                  <Select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as typeof form.gender })}
                  >
                    <option value="unknown">未知</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </Select>
                </div>
                <div>
                  <Label>现居地（可选）</Label>
                  <Input
                    placeholder="如：北京"
                    value={form.current_location}
                    onChange={(e) => setForm({ ...form, current_location: e.target.value })}
                  />
                </div>
                <div>
                  <Label>职业/行业（可选）</Label>
                  <Input
                    placeholder="如：互联网、教育"
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? '保存中…' : '保存并用于推演'}
                </Button>
              </form>
            </Card>
          </FadeIn>
          <FadeIn delay={80}>
            <InferenceChecklist profile={guestProfile} />
            {guestProfile && (
              <Link href={`/infer?profile=${guestProfile.id}`} className="block mt-4">
                <Button variant="accent" className="w-full gap-2">
                  前往推演
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
          </FadeIn>
        </div>
      ) : (
        <>
          {showForm && (
            <FadeIn>
              <Card>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label>姓名</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>出生日期时间</Label>
                    <Input
                      type="datetime-local"
                      required
                      value={form.birth_datetime}
                      onChange={(e) => setForm({ ...form, birth_datetime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>出生地点</Label>
                    <Input
                      value={form.birth_place}
                      onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>性别</Label>
                    <Select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as typeof form.gender })}
                    >
                      <option value="unknown">未知</option>
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </Select>
                  </div>
                  <Button type="submit">保存档案</Button>
                </form>
              </Card>
            </FadeIn>
          )}

          {loading ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : profiles.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-muted mb-4">暂无档案</p>
              <Button onClick={() => setShowForm(true)}>创建第一个档案</Button>
            </Card>
          ) : (
            <ul className="space-y-3">
              {profiles.map((p, i) => (
                <FadeIn key={p.id} delay={i * 50}>
                  <li>
                    <Card hover className="flex justify-between items-center gap-4 py-4">
                      <div>
                        <p className="font-medium font-serif text-lg">{p.name ?? '未命名'}</p>
                        <p className="text-sm text-muted mt-0.5">
                          {new Date(p.birth_datetime).toLocaleString('zh-CN')}
                          {p.birth_place ? ` · ${p.birth_place}` : ''}
                        </p>
                      </div>
                      <Link
                        href={`/infer?profile=${p.id}`}
                        className="inline-flex items-center gap-1 text-sm text-water hover:text-water/80 font-medium"
                      >
                        推演
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Card>
                  </li>
                </FadeIn>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
