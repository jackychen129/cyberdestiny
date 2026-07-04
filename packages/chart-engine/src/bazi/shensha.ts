import type { BaziChart, Pillar } from '../types';
import { mod } from './ganzhi-utils';

export interface ShenShaItem {
  name: string;
  pillar: 'year' | 'month' | 'day' | 'hour';
  basis: string;
  meaning: string;
}

const TIANYI: Record<number, string[]> = {
  0: ['丑', '未'], 1: ['子', '申'], 2: ['亥', '酉'], 3: ['亥', '酉'],
  4: ['丑', '未'], 5: ['子', '申'], 6: ['丑', '未'], 7: ['午', '寅'],
  8: ['卯', '巳'], 9: ['卯', '巳'],
};

const WENCHANG: Record<number, string> = {
  0: '巳', 1: '午', 2: '申', 3: '酉', 4: '申', 5: '酉', 6: '亥', 7: '子', 8: '寅', 9: '卯',
};

const YANGREN: Record<number, string> = {
  0: '卯', 1: '辰', 2: '午', 3: '未', 4: '午', 5: '未', 6: '酉', 7: '戌', 8: '子', 9: '丑',
};

const TAohua_GROUPS: Record<number, string> = { 0: '酉', 4: '酉', 8: '酉', 2: '卯', 6: '卯', 10: '卯', 3: '午', 7: '午', 11: '午', 1: '子', 5: '子', 9: '子' };
const HUAGAI_GROUPS: Record<number, string> = { 2: '戌', 6: '戌', 10: '戌', 8: '未', 0: '未', 4: '未', 5: '丑', 9: '丑', 1: '丑', 11: '辰', 3: '辰', 7: '辰' };
const YIMA_GROUPS: Record<number, string> = { 8: '寅', 0: '寅', 4: '寅', 2: '申', 6: '申', 10: '申', 5: '亥', 9: '亥', 1: '亥', 11: '巳', 3: '巳', 7: '巳' };

function branchIn(pillar: Pillar, targets: string | string[]): boolean {
  const arr = Array.isArray(targets) ? targets : [targets];
  return arr.includes(pillar.branch);
}

function checkGroup(pillar: Pillar, keyBranch: number, groups: Record<number, string>, name: string, meaning: string, pillarKey: 'year' | 'day'): ShenShaItem | null {
  const target = groups[mod(keyBranch, 12)];
  if (target && pillar.branch === target) {
    return { name, pillar: pillarKey, basis: `${pillarKey}:${pillar.branch}`, meaning };
  }
  return null;
}

export function computeShenSha(chart: BaziChart): ShenShaItem[] {
  const items: ShenShaItem[] = [];
  const pillars: { key: 'year' | 'month' | 'day' | 'hour'; p: Pillar }[] = [
    { key: 'year', p: chart.year },
    { key: 'month', p: chart.month },
    { key: 'day', p: chart.day },
    { key: 'hour', p: chart.hour },
  ];

  for (const { key, p } of pillars) {
    const ty = TIANYI[chart.day.stem_index];
    if (ty && branchIn(p, ty)) {
      items.push({ name: '天乙贵人', pillar: key, basis: `day_stem:${chart.day.stem}`, meaning: '贵人相助、逢凶化吉' });
    }
    if (p.branch === WENCHANG[chart.day.stem_index]) {
      items.push({ name: '文昌', pillar: key, basis: `day_stem:${chart.day.stem}`, meaning: '学业、文采、考试' });
    }
    if (p.branch === YANGREN[chart.day.stem_index]) {
      items.push({ name: '羊刃', pillar: key, basis: `day_stem:${chart.day.stem}`, meaning: '刚强、竞争、注意血光' });
    }
  }

  for (const { key, p } of pillars) {
    const t1 = checkGroup(p, chart.year.branch_index, TAohua_GROUPS, '桃花', '人缘、感情、魅力', 'year');
    if (t1) items.push(t1);
    const t2 = checkGroup(p, chart.day.branch_index, TAohua_GROUPS, '桃花', '人缘、感情、魅力', 'day');
    if (t2) items.push(t2);
    const h1 = checkGroup(p, chart.year.branch_index, HUAGAI_GROUPS, '华盖', '艺术、宗教、孤独', 'year');
    if (h1) items.push(h1);
    const y1 = checkGroup(p, chart.year.branch_index, YIMA_GROUPS, '驿马', '变动、出行、迁移', 'year');
    if (y1) items.push(y1);
  }

  const hongluan = ['卯', '寅', '丑', '子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰'][mod(chart.year.branch_index, 12)]!;
  const tianxi = ['酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌'][mod(chart.year.branch_index, 12)]!;
  for (const { key, p } of pillars) {
    if (p.branch === hongluan) items.push({ name: '红鸾', pillar: key, basis: `year_branch:${chart.year.branch}`, meaning: '婚恋、喜庆' });
    if (p.branch === tianxi) items.push({ name: '天喜', pillar: key, basis: `year_branch:${chart.year.branch}`, meaning: '喜事、婚庆' });
  }

  return dedupe(items);
}

function dedupe(items: ShenShaItem[]): ShenShaItem[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    const k = `${i.name}:${i.pillar}:${i.basis}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
