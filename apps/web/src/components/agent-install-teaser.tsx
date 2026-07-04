'use client';

import Link from 'next/link';
import { Bot } from 'lucide-react';
import { buildSkillCloneInstallOneLiner, GITHUB_REPO_URL } from '@cyberdestiny/shared';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { CopyPrompt } from '@/components/copy-prompt';

export function AgentInstallTeaser() {
  return (
    <Card className="space-y-4" glow>
      <CardTitle className="flex items-center gap-2">
        <Bot className="size-5 text-accent" />
        Agent Skill · 一句话安装
      </CardTitle>
      <CardDescription>
        GitHub 仅发布 Skill。安装后配置本地 MCP 即可让 Agent 代你推演。
      </CardDescription>
      <CopyPrompt label="终端安装" text={buildSkillCloneInstallOneLiner()} />
      <div className="flex flex-wrap gap-2">
        <Link href="/agent">
          <Button variant="accent" size="sm">
            更多安装方式
          </Button>
        </Link>
        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            GitHub
          </Button>
        </a>
      </div>
    </Card>
  );
}
