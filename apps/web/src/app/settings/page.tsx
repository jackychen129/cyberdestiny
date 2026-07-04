'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, Check, LogOut } from 'lucide-react';
import type { Profile } from '@cyberdestiny/shared';
import {
  buildAgentFullSetupPrompt,
  buildAgentInstallOneLiner,
  buildAgentSkillPrompt,
  buildDailyFortunePrompt,
  buildDailySubscribePrompt,
  buildSkillCloneInstallOneLiner,
  GITHUB_REPO_URL,
} from '@cyberdestiny/shared';
import { useAuth } from '@/components/auth-provider';
import { apiGet } from '@/lib/api';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FadeIn } from '@/components/ui/fade-in';
import { CopyPrompt } from '@/components/copy-prompt';

export default function SettingsPage() {
  const { user, token, loading, logout } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [credits, setCredits] = useState<number | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiGet<{ api_key: string; credits_balance: number }>('/auth/me', token).then((d) => {
      setApiKey(d.api_key);
      setCredits(d.credits_balance);
    });
    apiGet<{ items: Profile[] }>('/profiles', token).then((d) => setProfiles(d.items));
  }, [token]);

  if (loading) return <PageSkeleton />;

  if (!user) {
    return (
      <div className="space-y-6 py-12 text-center max-w-md mx-auto">
        <PageHeader title="账户设置" description="请先登录以查看 API Key；Agent 安装无需登录" className="text-center" />
        <Link href="/agent">
          <Button variant="accent">Agent 一句话安装</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">前往登录</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl">
      <PageHeader title="账户设置" description="个人信息与 Agent 集成配置" />

      <FadeIn>
        <Card className="space-y-4">
          <CardTitle>个人信息</CardTitle>
          <p className="text-sm">用户名：{user.username}</p>
          {user.email && <p className="text-sm text-muted">{user.email}</p>}
          {credits !== null && <Badge variant="accent">积分 {credits}</Badge>}
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <LogOut className="size-4" />
            退出登录
          </Button>
        </Card>
      </FadeIn>

      <FadeIn delay={80}>
        <Card className="space-y-4">
          <CardTitle>Agent API Key</CardTitle>
          <p className="text-sm text-muted leading-relaxed">
            用于 Cursor MCP / OpenClaw。配置见{' '}
            <code className="text-xs bg-ink/5 px-1.5 py-0.5 rounded">docs/AGENT_SETUP.md</code>
          </p>
          {apiKey && (
            <div className="flex gap-2 items-stretch">
              <code className="flex-1 text-xs bg-ink/5 p-3 rounded-lg break-all font-mono">{apiKey}</code>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? '已复制' : '复制'}
              </Button>
            </div>
          )}
          <pre className="text-xs bg-ink/5 p-4 rounded-xl overflow-x-auto leading-relaxed">{`{
  "mcpServers": {
    "cyberdestiny": {
      "command": "node",
      "args": ["packages/mcp/dist/index.js"],
      "env": {
        "CYBERDESTINY_API_URL": "http://localhost:3001",
        "CYBERDESTINY_API_KEY": "${apiKey || '你的 Key'}"
      }
    }
  }
}`}</pre>
        </Card>
      </FadeIn>

      <FadeIn delay={120}>
        <Card className="space-y-4">
          <CardTitle>Agent 一句话安装</CardTitle>
          <p className="text-sm text-muted leading-relaxed">
            完整入口见{' '}
            <Link href="/agent" className="text-water hover:underline">
              /agent
            </Link>
            {' · '}
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-water hover:underline">
              GitHub
            </a>
          </p>
          <CopyPrompt label="终端克隆安装" text={buildSkillCloneInstallOneLiner()} />
          <CopyPrompt
            label="Agent 全自动安装"
            hint="粘贴到 Cursor，由 Agent 完成配置与首次推演。"
            text={buildAgentInstallOneLiner(API_URL, apiKey || 'cd_dev_local_key')}
          />
          <CopyPrompt
            label="启用推演 Skill"
            hint="项目已含 Skill 文件时，复制此句即可让 Agent 按规范调用工具。"
            text={buildAgentSkillPrompt()}
          />
          {profiles[0] && (
            <>
              <CopyPrompt
                label="订阅每日运势（早 8 点）"
                hint={`当前默认档案：${profiles[0].name ?? '匿名命主'}`}
                text={buildDailySubscribePrompt(profiles[0].id)}
              />
              <CopyPrompt
                label="立即获取今日运势"
                text={buildDailyFortunePrompt(profiles[0].id)}
              />
            </>
          )}
          {apiKey && (
            <CopyPrompt
              label="完整接入 + 订阅（含 API Key）"
              hint="新环境首次配置 MCP 时使用；Key 仅用于本地 Agent，勿公开分享。"
              text={buildAgentFullSetupPrompt(API_URL, apiKey, profiles[0]?.id)}
            />
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
