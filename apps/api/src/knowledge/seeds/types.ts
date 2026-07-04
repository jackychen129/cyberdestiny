/** 知识库种子条目 — 启动时按 title 增量写入 */
export interface KnowledgeSeed {
  type: 'classic' | 'glossary' | 'fiction_mapping' | 'principle' | 'science' | 'current_affairs';
  tradition:
    | 'bagua'
    | 'dao'
    | 'wuxing'
    | 'fengshui'
    | 'bazi'
    | 'tianli'
    | 'ziwei'
    | 'calendar'
    | 'neijing'
    | 'quantum'
    | 'physics'
    | 'complexity'
    | 'neuro'
    | 'systems'
    | 'world';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}
