import { Injectable, OnModuleInit } from '@nestjs/common';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { getDailyClassic } from '@cyberdestiny/chart-engine';
import { ALL_KNOWLEDGE_SEEDS, KNOWLEDGE_SEED_VERSION } from './seeds';
import { knowledgeEntries } from '../database/schema';
import { DatabaseService } from '../database/database.service';
import { WorldContextService } from './world-context.service';

type KnowledgeRow = typeof knowledgeEntries.$inferSelect;

export interface ClassicPick {
  title: string;
  content: string;
  basis: string;
  tradition?: string | null;
}

const SEED_ENTRIES = [
  {
    type: 'classic',
    tradition: 'dao',
    title: '道德经 · 第一章',
    content: '道可道，非常道。名可名，非常名。无名天地之始，有名万物之母。',
    metadata: { source: '道德经', chapter: 1 },
  },
  {
    type: 'classic',
    tradition: 'dao',
    title: '道德经 · 致虚极',
    content: '致虚极，守静笃。万物并作，吾以观复。夫物芸芸，各复归其根。',
    metadata: { source: '道德经', chapter: 16 },
  },
  {
    type: 'classic',
    tradition: 'bagua',
    title: '易经 · 乾卦彖传',
    content: '大哉乾元，万物资始，乃统天。云行雨施，品物流形。',
    metadata: { source: '易经', hexagram: '乾' },
  },
  {
    type: 'classic',
    tradition: 'wuxing',
    title: '滴天髓 · 论五行',
    content: '五行之气，始于一而终于一，生克循环，造化无穷。',
    metadata: { source: '滴天髓' },
  },
  {
    type: 'glossary',
    tradition: 'bagua',
    title: '用神',
    content: '命局中对平衡最关键的五行或十神，为断命之枢纽。',
    metadata: { term: '用神' },
  },
  {
    type: 'glossary',
    tradition: 'bagua',
    title: '六爻',
    content: '纳甲筮法，以六个爻位断事，世应用神为关键。',
    metadata: { term: '六爻' },
  },
  {
    type: 'fiction_mapping',
    tradition: 'dao',
    title: '一人之下 · 性命双修',
    content: '性功修心性，命功修炁与术法；二者并重，方能在命运洪流中保有自主。',
    metadata: { fiction_title: '一人之下', mapped_concept: '性命双修', tag: 'fiction_mapping' },
  },
  {
    type: 'fiction_mapping',
    tradition: 'dao',
    title: '一人之下 · 命运与选择',
    content: '知命不认命，在看清格局之后仍以选择塑造路径——象意参考，非独断依据。',
    metadata: { fiction_title: '一人之下', mapped_concept: '改命', tag: 'fiction_mapping' },
  },
];

const FICTION_PACK = [
  {
    type: 'fiction_mapping',
    tradition: 'dao',
    title: '一人之下 · 炁与术法',
    content: '炁为术法之本，修炁需明理明心——现代叙事中的修行隐喻，可作象意参考。',
    metadata: { fiction_title: '一人之下', mapped_concept: '炁' },
  },
  {
    type: 'fiction_mapping',
    tradition: 'dao',
    title: '一人之下 · 全性一派',
    content: '全性求自在，不拘一格；命理上象征反常规路径与非常规用神。',
    metadata: { fiction_title: '一人之下', mapped_concept: '全性' },
  },
  {
    type: 'fiction_mapping',
    tradition: 'dao',
    title: '一人之下 · 天师府',
    content: '正一派系，重符箓与传承；映射正统典籍体系与师承脉络。',
    metadata: { fiction_title: '一人之下', mapped_concept: '师承' },
  },
  {
    type: 'fiction_mapping',
    tradition: 'dao',
    title: '一人之下 · 八奇技',
    content: '极致专精一术；命理上可喻某一十神或用神极致发挥。',
    metadata: { fiction_title: '一人之下', mapped_concept: '专精' },
  },
];

@Injectable()
export class KnowledgeService implements OnModuleInit {
  private classicPoolCache: KnowledgeRow[] | null = null;

  constructor(
    private readonly database: DatabaseService,
    private readonly worldContext: WorldContextService,
  ) {}

  async onModuleInit() {
    await this.seedIfEmpty();
    await this.seedFictionPack();
    await this.seedAllKnowledge();
  }

  private async seedAllKnowledge() {
    for (const entry of ALL_KNOWLEDGE_SEEDS) {
      const existing = await this.database.db
        .select()
        .from(knowledgeEntries)
        .where(eq(knowledgeEntries.title, entry.title))
        .limit(1);
      if (existing.length === 0) {
        await this.database.db.insert(knowledgeEntries).values({
          ...entry,
          metadata: { ...entry.metadata, seed_version: KNOWLEDGE_SEED_VERSION },
        });
      }
    }
    this.classicPoolCache = null;
  }

  private async seedFictionPack() {
    const fiction = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(sql`${knowledgeEntries.type} = 'fiction_mapping'`);
    if (fiction.length >= 6) return;
    for (const entry of FICTION_PACK) {
      const exists = fiction.some((f: KnowledgeRow) => f.title === entry.title);
      if (!exists) {
        await this.database.db.insert(knowledgeEntries).values(entry);
      }
    }
  }

  private async seedIfEmpty() {
    const existing = await this.database.db.select().from(knowledgeEntries).limit(1);
    if (existing.length > 0) return;
    await this.database.db.insert(knowledgeEntries).values(SEED_ENTRIES);
  }

  private async getClassicPool(): Promise<KnowledgeRow[]> {
    if (this.classicPoolCache) return this.classicPoolCache;
    const rows = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(sql`${knowledgeEntries.type} IN ('classic', 'principle')`);
    this.classicPoolCache = rows;
    return rows;
  }

  /** 按种子与五行选取每日典籍（推演/日运专用） */
  async pickDailyClassic(
    seed: number,
    opts?: { element?: string; tradition?: string },
  ): Promise<ClassicPick> {
    let pool = await this.getClassicPool();
    if (pool.length === 0) return getDailyClassic(seed);

    if (opts?.tradition) {
      const byTradition = pool.filter((r) => r.tradition === opts.tradition);
      if (byTradition.length > 0) pool = byTradition;
    }
    if (opts?.element) {
      const byElement = pool.filter(
        (r) =>
          r.content.includes(opts.element!) ||
          (r.metadata as Record<string, unknown>)?.wuxing === opts.element ||
          (r.metadata as Record<string, unknown>)?.element === opts.element,
      );
      if (byElement.length > 0) pool = byElement;
    }

    const row = pool[Math.abs(seed) % pool.length]!;
    return rowToClassic(row);
  }

  /** 据命盘气机检索相关典籍与天理原则 */
  async resolveClassicsForInference(ctx: {
    seed: number;
    dayMasterElement?: string;
    hasClash?: boolean;
    scope?: string;
    limit?: number;
  }): Promise<ClassicPick[]> {
    const limit = ctx.limit ?? 3;
    const picks: ClassicPick[] = [];
    const seen = new Set<string>();

    const add = (c: ClassicPick) => {
      if (!seen.has(c.title) && picks.length < limit) {
        seen.add(c.title);
        picks.push(c);
      }
    };

    add(await this.pickDailyClassic(ctx.seed, { element: ctx.dayMasterElement }));

    if (ctx.hasClash) {
      const clash = await this.classicSearch('吉凶', 2, false, 'bagua', true);
      for (const item of clash.items) add(itemToClassic(item));
    }

    if (ctx.dayMasterElement) {
      const el = await this.classicSearch(ctx.dayMasterElement, 2, false, 'bazi', true);
      for (const item of el.items) add(itemToClassic(item));
    }

    const tianli = await this.classicSearch('天理', 2, false, 'tianli', true);
    for (const item of tianli.items) add(itemToClassic(item));

    if (ctx.scope === 'lifetime') {
      const ming = await this.classicSearch('知命', 1, false, 'tianli', true);
      for (const item of ming.items) add(itemToClassic(item));
    }

    return picks;
  }

  /** 现代科学 + 时事脉搏 — 推演补充层 */
  async resolveModernContextForInference(ctx: {
    seed: number;
    hasClash?: boolean;
  }): Promise<{
    science: ClassicPick;
    world_lines: string[];
    disclaimer: string;
  }> {
    const scienceRows = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(sql`${knowledgeEntries.type} IN ('science', 'principle') AND ${knowledgeEntries.tradition} IN ('quantum', 'physics', 'complexity', 'systems', 'neuro')`);

    let pool = scienceRows;
    if (ctx.hasClash) {
      const chaos = scienceRows.filter(
        (r) =>
          r.content.includes('混沌') ||
          r.content.includes('临界') ||
          (r.metadata as Record<string, unknown>)?.concept === 'butterfly',
      );
      if (chaos.length > 0) pool = chaos;
    }
    if (pool.length === 0) {
      pool = scienceRows;
    }
    const scienceRow = pool[Math.abs(ctx.seed) % Math.max(pool.length, 1)] ?? scienceRows[0];
    const science = scienceRow
      ? rowToClassic(scienceRow)
      : {
          title: '科学象意 · 概率而非定数',
          content: '现代物理学以概率描述世界，命盘示倾向非定数。',
          basis: 'science:fallback',
        };

    const pulse = await this.worldContext.getWorldPulse(3);
    const world_lines: string[] = [];
    for (const h of pulse.headlines.slice(0, 2)) {
      world_lines.push('【' + h.source + '】' + h.title + '：' + h.summary.slice(0, 120));
    }
    for (const t of pulse.themes.slice(0, 1)) {
      world_lines.push('「' + t.title + '」' + t.content.slice(0, 100));
    }

    return {
      science,
      world_lines,
      disclaimer: pulse.disclaimer,
    };
  }

  async searchScience(query: string, limit = 5) {
    return this.classicSearch(query, limit, false, undefined, true, true);
  }

  async getStats() {
    const rows = await this.database.db.select().from(knowledgeEntries);
    const byType: Record<string, number> = {};
    const byTradition: Record<string, number> = {};
    for (const r of rows) {
      byType[r.type] = (byType[r.type] ?? 0) + 1;
      const t = r.tradition ?? 'other';
      byTradition[t] = (byTradition[t] ?? 0) + 1;
    }
    return {
      total: rows.length,
      seed_version: KNOWLEDGE_SEED_VERSION,
      by_type: byType,
      by_tradition: byTradition,
      traditions: Object.keys(byTradition).sort(),
    };
  }

  async listByTradition(tradition: string, limit = 20) {
    const rows = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(eq(knowledgeEntries.tradition, tradition))
      .limit(limit);
    return {
      items: rows.map((r) => ({
        id: r.id,
        type: r.type,
        tradition: r.tradition,
        title: r.title,
        content: r.content,
        metadata: r.metadata,
        fiction_only: r.type === 'fiction_mapping',
      })),
      tradition,
      total: rows.length,
    };
  }

  async listAll(limit = 20, includeFiction = true) {
    const rows = await this.database.db.select().from(knowledgeEntries).limit(limit * 3);
    const filtered = rows
      .filter((r: KnowledgeRow) => includeFiction || r.type !== 'fiction_mapping')
      .slice(0, limit)
      .map((r: KnowledgeRow) => rowToItem(r));
    return { items: filtered, total: filtered.length };
  }

  async classicSearch(
    query: string,
    limit = 5,
    includeFiction = false,
    tradition?: string,
    includePrinciples = true,
    includeModern = false,
  ) {
    const types = includeFiction
      ? ['classic', 'glossary', 'fiction_mapping', 'principle', 'science', 'current_affairs']
      : includeModern
        ? ['classic', 'glossary', 'principle', 'science', 'current_affairs']
        : includePrinciples
          ? ['classic', 'glossary', 'principle']
          : ['classic', 'glossary'];

    const rows = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(
        or(
          ilike(knowledgeEntries.title, `%${query}%`),
          ilike(knowledgeEntries.content, `%${query}%`),
        ),
      )
      .limit(limit * 4);

    const filtered = rows
      .filter((r: KnowledgeRow) => types.includes(r.type))
      .filter((r: KnowledgeRow) => !tradition || r.tradition === tradition)
      .sort((a, b) => scoreRelevance(query, b.title, b.content) - scoreRelevance(query, a.title, a.content))
      .slice(0, limit)
      .map((r: KnowledgeRow) => rowToItem(r, query));

    return { items: filtered, query, limit, tradition, total: filtered.length };
  }

  async listGlossary() {
    const rows = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(sql`${knowledgeEntries.type} = 'glossary'`);
    return { items: rows };
  }

  async getGlossary(term: string) {
    const rows = await this.database.db
      .select()
      .from(knowledgeEntries)
      .where(ilike(knowledgeEntries.title, `%${term}%`))
      .limit(1);
    return rows[0]?.content ?? null;
  }
}

function rowToClassic(r: KnowledgeRow): ClassicPick {
  const prefix =
    r.type === 'science' ? 'science:' : r.type === 'current_affairs' ? 'world:' : 'classic:';
  return {
    title: r.title,
    content: r.content,
    basis: prefix + r.title,
    tradition: r.tradition,
  };
}

function itemToClassic(item: { title: string; content: string }): ClassicPick {
  return { title: item.title, content: item.content, basis: 'classic:' + item.title };
}

function rowToItem(r: KnowledgeRow, query?: string) {
  return {
    id: r.id,
    type: r.type,
    tradition: r.tradition,
    title: r.title,
    content: r.content,
    metadata: r.metadata,
    relevance: query ? scoreRelevance(query, r.title, r.content) : 1,
    fiction_only: r.type === 'fiction_mapping',
  };
}

function scoreRelevance(query: string, title: string, content: string): number {
  let score = 0.5;
  if (title.includes(query)) score += 0.3;
  if (content.includes(query)) score += 0.2;
  return Math.min(1, score);
}
