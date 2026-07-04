import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { knowledgeEntries } from '../database/schema';
import { DatabaseService } from '../database/database.service';

export interface WorldHeadline {
  title: string;
  summary: string;
  source: string;
  link?: string;
  fetched_at: string;
}

const RSS_SOURCES = [
  {
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  },
  {
    name: 'Reuters World',
    url: 'https://feeds.reuters.com/reuters/worldNews',
  },
];

const DYNAMIC_TITLE_PREFIX = '时事脉搏 · ';

@Injectable()
export class WorldContextService implements OnModuleInit {
  private readonly logger = new Logger(WorldContextService.name);
  private lastRefreshAt: string | null = null;

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    const stale = await this.isStale();
    if (stale) {
      await this.refreshWorldContext().catch((e) =>
        this.logger.warn('初始时事拉取失败，将使用种子主题: ' + (e as Error).message),
      );
    }
  }

  async isStale(): Promise<boolean> {
    const rows = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(sql`${knowledgeEntries.type} = 'current_affairs' AND ${knowledgeEntries.metadata}->>'dynamic' = 'true'`)
      .limit(1);
    if (rows.length === 0) return true;
    const meta = rows[0]!.metadata as Record<string, unknown>;
    const fetched = meta.fetched_at as string | undefined;
    if (!fetched) return true;
    const age = Date.now() - new Date(fetched).getTime();
    return age > 12 * 60 * 60 * 1000; // 12 小时
  }

  /** 从 RSS 拉取最新时事并写入知识库 */
  async refreshWorldContext(): Promise<{ inserted: number; headlines: WorldHeadline[] }> {
    const headlines = await this.fetchHeadlines(8);
    const fetchedAt = new Date().toISOString();
    const dateLabel = fetchedAt.slice(0, 10);

    await this.database.db
      .delete(knowledgeEntries)
      .where(sql`${knowledgeEntries.type} = 'current_affairs' AND ${knowledgeEntries.metadata}->>'dynamic' = 'true'`);

    let inserted = 0;
    for (const h of headlines) {
      const title = DYNAMIC_TITLE_PREFIX + h.title.slice(0, 80);
      await this.database.db.insert(knowledgeEntries).values({
        type: 'current_affairs',
        tradition: 'world',
        title,
        content: h.summary + (h.link ? '\n来源：' + h.link : ''),
        metadata: {
          dynamic: true,
          source: h.source,
          link: h.link,
          fetched_at: fetchedAt,
          date: dateLabel,
        },
      });
      inserted++;
    }

    this.lastRefreshAt = fetchedAt;
    this.logger.log(`时事脉搏已更新 ${inserted} 条`);
    return { inserted, headlines };
  }

  async getWorldPulse(limit = 5): Promise<{
    headlines: WorldHeadline[];
    themes: { title: string; content: string }[];
    refreshed_at: string | null;
    disclaimer: string;
  }> {
    const dynamic = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(sql`${knowledgeEntries.type} = 'current_affairs' AND ${knowledgeEntries.metadata}->>'dynamic' = 'true'`)
      .limit(limit);

    const themes = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(sql`${knowledgeEntries.type} = 'current_affairs' AND (${knowledgeEntries.metadata}->>'dynamic' IS NULL OR ${knowledgeEntries.metadata}->>'dynamic' != 'true')`)
      .limit(3);

    const headlines: WorldHeadline[] = dynamic.map((r) => {
      const m = (r.metadata ?? {}) as Record<string, unknown>;
      return {
        title: r.title.replace(DYNAMIC_TITLE_PREFIX, ''),
        summary: r.content.split('\n来源：')[0] ?? r.content,
        source: (m.source as string) ?? 'unknown',
        link: m.link as string | undefined,
        fetched_at: (m.fetched_at as string) ?? '',
      };
    });

    return {
      headlines,
      themes: themes.map((t) => ({ title: t.title, content: t.content })),
      refreshed_at: this.lastRefreshAt ?? (headlines[0]?.fetched_at ?? null),
      disclaimer: '时事为外部信息补充，与命理计算独立；仅供参考，请核验权威来源。',
    };
  }

  async fetchHeadlines(limit: number): Promise<WorldHeadline[]> {
    const all: WorldHeadline[] = [];
    for (const src of RSS_SOURCES) {
      try {
        const items = await this.parseRss(src.url, Math.ceil(limit / RSS_SOURCES.length) + 2);
        for (const item of items) {
          all.push({
            title: item.title,
            summary: item.description || item.title,
            source: src.name,
            link: item.link,
            fetched_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        this.logger.warn(`RSS ${src.name} 失败: ${(e as Error).message}`);
      }
    }

    if (all.length === 0) {
      return this.fallbackHeadlines();
    }

    return all.slice(0, limit);
  }

  private fallbackHeadlines(): WorldHeadline[] {
    const now = new Date().toISOString();
    return [
      {
        title: '外部 feed 暂不可用，使用宏观主题补充',
        summary: '请稍后重试 refresh，或查阅知识库「时势主题」条目。AI、气候、地缘、金融周期等长期变量仍纳入推演参考。',
        source: 'CyberDestiny',
        fetched_at: now,
      },
    ];
  }

  private async parseRss(
    url: string,
    limit: number,
  ): Promise<{ title: string; description: string; link?: string }[]> {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CyberDestiny/1.0 (world-context)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const xml = await res.text();
    const items: { title: string; description: string; link?: string }[] = [];
    const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
    for (const block of itemBlocks.slice(0, limit)) {
      const title = extractTag(block, 'title');
      const description = stripHtml(extractTag(block, 'description') || extractTag(block, 'summary'));
      const link = extractTag(block, 'link');
      if (title) items.push({ title, description: description || title, link });
    }
    return items;
  }
}

function extractTag(xml: string, tag: string): string {
  const cdata = new RegExp('<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></' + tag + '>', 'i').exec(xml);
  if (cdata?.[1]) return cdata[1].trim();
  const plain = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i').exec(xml);
  return plain?.[1]?.trim() ?? '';
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 400);
}
