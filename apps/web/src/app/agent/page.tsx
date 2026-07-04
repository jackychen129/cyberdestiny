'use client';

import Link from 'next/link';
import { Bot, Github, Terminal } from 'lucide-react';
import {
  buildAgentInstallOneLiner,
  buildAgentSkillPrompt,
  buildMcpConfigJson,
  buildSkillCloneInstallOneLiner,
  GITHUB_REPO_URL,
} from '@cyberdestiny/shared';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { CopyPrompt } from '@/components/copy-prompt';
import { FadeIn } from '@/components/ui/fade-in';
import { Badge } from '@/components/ui/badge';

const DEFAULT_MCP_PATH = '/path/to/cyberdestiny/packages/mcp/dist/index.js';

export default function AgentPage() {
  const shellInstall = buildSkillCloneInstallOneLiner();
  const agentInstall = buildAgentInstallOneLiner(API_URL, 'cd_dev_local_key');
  const skillPrompt = buildAgentSkillPrompt();
  const mcpJson = buildMcpConfigJson(DEFAULT_MCP_PATH, API_URL, 'cd_dev_local_key');

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Agent Skill 安装"
        description="一句话克隆、配置 MCP、让 Cursor / OpenClaw 代你窥探天机。"
      >
        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <Github className="size-4" />
            GitHub
          </Button>
        </a>
      </PageHeader>

      <FadeIn>
        <Card className="space-y-3" glow>
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-water" />
            <CardTitle>终端一句话安装</CardTitle>
            <Badge variant="wood">推荐</Badge>
          </div>
          <CardDescription>
            克隆仓库、构建 MCP、安装 Skill 到 ~/.cursor/skills/，并初始化数据库。
          </CardDescription>
          <CopyPrompt label="复制并在终端执行" text={shellInstall} />
        </Card>
      </FadeIn>

      <FadeIn delay={80}>
        <Card className="space-y-3" glow>
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-accent" />
            <CardTitle>Agent 一句话安装</CardTitle>
          </div>
          <CardDescription>
            粘贴到 Cursor Agent 对话，由 Agent 代为完成克隆、MCP 配置与首次推演。
          </CardDescription>
          <CopyPrompt
            label="复制粘贴到 Cursor"
            hint="安装完成后重启 Cursor 以加载 MCP。"
            text={agentInstall}
          />
        </Card>
      </FadeIn>

      <FadeIn delay={120}>
        <Card className="space-y-3">
          <CardTitle>已安装 — 启用推演 Skill</CardTitle>
          <CopyPrompt label="日常使用" text={skillPrompt} />
        </Card>
      </FadeIn>

      <FadeIn delay={160}>
        <Card className="space-y-3">
          <CardTitle>MCP 配置参考</CardTitle>
          <CardDescription>
            写入 <code className="text-xs bg-ink/5 px-1 rounded">~/.cursor/mcp.json</code>，
            将 <code className="text-xs bg-ink/5 px-1 rounded">args</code> 路径改为你本机克隆目录。
          </CardDescription>
          <CopyPrompt label="mcp.json" text={mcpJson} />
        </Card>
      </FadeIn>

      <FadeIn delay={200}>
        <Card className="text-sm text-muted leading-relaxed space-y-2">
          <p>
            登录 Web 后可在{' '}
            <Link href="/settings" className="text-water hover:underline">
              设置
            </Link>{' '}
            复制 Personal API Key，替换 MCP 中的 <code className="text-xs bg-ink/5 px-1 rounded">CYBERDESTINY_API_KEY</code>。
          </p>
          <p>完整文档见仓库 docs/AGENT_SETUP.md 与 docs/SKILL_ONE_LINER.md。</p>
        </Card>
      </FadeIn>
    </div>
  );
}
