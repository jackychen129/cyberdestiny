import { CLASSICS_EXTENDED } from '../classics-seed';
import { CLASSICS_BAGUA } from './classics-bagua';
import { CLASSICS_DAO } from './classics-dao';
import { CLASSICS_BAZI } from './classics-bazi';
import { GLOSSARY_CORE } from './glossary-core';
import { PRINCIPLES_TIANLI } from './principles-tianli';
import { SCIENCE_MODERN, WORLD_THEMES } from './science-modern';
import type { KnowledgeSeed } from './types';

/** 知识库种子版本 — 递增后触发增量写入 */
export const KNOWLEDGE_SEED_VERSION = 4;

/** 全部可增量写入的种子条目（按 title 去重） */
export const ALL_KNOWLEDGE_SEEDS: KnowledgeSeed[] = [
  ...CLASSICS_EXTENDED,
  ...CLASSICS_BAGUA,
  ...CLASSICS_DAO,
  ...CLASSICS_BAZI,
  ...GLOSSARY_CORE,
  ...PRINCIPLES_TIANLI,
  ...SCIENCE_MODERN,
  ...WORLD_THEMES,
];

export const KNOWLEDGE_TRADITIONS = [
  'bagua',
  'dao',
  'wuxing',
  'bazi',
  'tianli',
  'fengshui',
  'neijing',
  'calendar',
  'ziwei',
  'quantum',
  'physics',
  'complexity',
  'neuro',
  'systems',
  'world',
] as const;
