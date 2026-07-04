'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/fade-in';
import { cn } from '@/lib/utils';

interface KnowledgeItem {
  id: string;
  type: string;
  tradition?: string;
  title: string;
  content: string;
  fiction_only?: boolean;
}

interface KnowledgeStats {
  total: number;
  seed_version: number;
  by_type: Record<string, number>;
  by_tradition: Record<string, number>;
}

const TRADITION_LABELS: Record<string, string> = {
  bagua: '周易',
  dao: '道家',
  bazi: '子平',
  tianli: '天理',
  wuxing: '五行',
  neijing: '内经',
  fengshui: '风水',
  calendar: '历法',
  quantum: '量子',
  physics: '物理',
  complexity: '复杂性',
  neuro: '神经科学',
  systems: '系统论',
  world: '时事',
};

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [tradition, setTradition] = useState('');
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [includeFiction, setIncludeFiction] = useState(false);

  useEffect(() => {
    apiGet<KnowledgeStats>('/knowledge/stats').then(setStats);
  }, []);

  useEffect(() => {
    const q = query.trim();
    let path: string;
    if (q) {
      path =
        '/knowledge/classic_search?q=' +
        encodeURIComponent(q) +
        '&fiction=' +
        (includeFiction ? '1' : '0') +
        '&limit=20';
      if (tradition) path += '&tradition=' + encodeURIComponent(tradition);
    } else if (tradition) {
      path = '/knowledge/entries?tradition=' + encodeURIComponent(tradition);
    } else {
      path = '/knowledge/entries';
    }
    apiGet<{ items: KnowledgeItem[] }>(path).then((d) => setItems(d.items ?? []));
  }, [query, includeFiction, tradition]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="典籍知识库"
        description="周易 · 道家 · 子平命理 · 天理 · 量子科学 · 时事脉搏"
      >
        {stats && (
          <div className="flex flex-wrap gap-2">
            <Badge>{stats.total} 条</Badge>
            <Badge variant="accent">v{stats.seed_version}</Badge>
          </div>
        )}
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTradition('')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-sm border transition-all duration-200',
            tradition === ''
              ? 'bg-ink text-paper border-ink'
              : 'bg-white/60 border-border hover:bg-white hover:-translate-y-px',
          )}
        >
          全部
        </button>
        {Object.entries(TRADITION_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTradition(key)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-sm border transition-all duration-200',
              tradition === key
                ? 'bg-ink text-paper border-ink'
                : 'bg-white/60 border-border hover:bg-white hover:-translate-y-px',
            )}
          >
            {label}
            {stats?.by_tradition[key] != null && (
              <span className="ml-1 opacity-60">{stats.by_tradition[key]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
          <Input
            className="pl-10"
            placeholder="搜索典籍、术语、天理…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-border"
            checked={includeFiction}
            onChange={(e) => setIncludeFiction(e.target.checked)}
          />
          含 fiction 映射
        </label>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <FadeIn key={item.id} delay={Math.min(i * 40, 400)}>
            <Card hover>
              <div className="flex gap-2 text-xs mb-3 flex-wrap">
                <Badge>{item.type}</Badge>
                {item.tradition && (
                  <Badge variant="water">{TRADITION_LABELS[item.tradition] ?? item.tradition}</Badge>
                )}
                {item.fiction_only && <Badge variant="fire">象意参考</Badge>}
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <p className="text-sm mt-2 leading-relaxed text-ink-soft">{item.content}</p>
            </Card>
          </FadeIn>
        ))}
        {items.length === 0 && (
          <Card className="text-center py-12 text-muted text-sm">无匹配条目</Card>
        )}
      </div>
    </div>
  );
}
