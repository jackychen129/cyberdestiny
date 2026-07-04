'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Alert } from '@/components/ui/alert';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FadeIn } from '@/components/ui/fade-in';
import { apiGet } from '@/lib/api';

function LoginForm() {
  const { loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);

  useEffect(() => {
    apiGet<{ configured: boolean }>('/auth/google/status')
      .then((d) => setGoogleReady(d.configured))
      .catch(() => setGoogleReady(false));
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-8 py-8 md:py-16">
      <PageHeader
        title="登录赛博天命"
        description="Web 与 Agent 共享档案、报告与积分"
        className="text-center [&_h1]:text-2xl"
      />

      {error && (
        <Alert variant="error">
          登录失败：{error}。请检查 Google OAuth 配置（见 docs/AGENT_SETUP.md）。
        </Alert>
      )}

      <FadeIn delay={100}>
        <Card className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            variant="accent"
            onClick={loginWithGoogle}
            disabled={googleReady === false}
          >
            使用 Google 登录
          </Button>
          {googleReady === false && (
            <p className="text-xs text-muted leading-relaxed">
              未配置 GOOGLE_CLIENT_ID。本地开发可在 .env 中配置，或继续使用匿名模式（无账户同步）。
            </p>
          )}
          <p className="text-xs text-muted text-center">
            登录即表示同意将推演用于自我反思与文化学习参考
          </p>
        </Card>
      </FadeIn>

      <p className="text-center text-sm text-muted">
        <Link href="/" className="text-water hover:underline transition-colors">
          返回首页
        </Link>
        {' · '}
        <Link href="/infer" className="text-water hover:underline transition-colors">
          匿名推演
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
