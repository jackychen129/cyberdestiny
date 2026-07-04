'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuth } from '@/lib/auth';
import { useAuth } from '@/components/auth-provider';
import { PageSkeleton } from '@/components/ui/skeleton';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshMe } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const username = params.get('username');
    const userId = params.get('user_id');
    const from = params.get('from');

    if (from === 'google' && token && userId) {
      setAuth(token, { id: userId, username: username ?? '用户' });
      refreshMe().then(() => router.replace('/settings'));
      return;
    }
    router.replace('/login?error=invalid_callback');
  }, [params, router, refreshMe]);

  return (
    <div className="py-16 text-center space-y-4 animate-fade-in">
      <div className="size-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
      <p className="text-muted text-sm">正在完成登录…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CallbackHandler />
    </Suspense>
  );
}
