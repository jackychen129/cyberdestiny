import { HEXAGRAM_NAMES, TRIGRAMS } from '../types';

export interface MeihuaChart {
  method: 'number' | 'time';
  upper_trigram: string;
  lower_trigram: string;
  body_trigram: string;
  use_trigram: string;
  hexagram: string;
  relation: string;
  interpretation_hint: string;
}

export function meihuaByNumbers(a: number, b: number, c?: number): MeihuaChart {
  const upper = TRIGRAMS[a % 8]!;
  const lower = TRIGRAMS[b % 8]!;
  const moving = (c ?? a + b) % 8;
  const body = TRIGRAMS[moving]!;
  const use = TRIGRAMS[(moving + 1) % 8]!;
  const idx = (a + b + (c ?? 0)) % HEXAGRAM_NAMES.length;
  return {
    method: 'number',
    upper_trigram: upper,
    lower_trigram: lower,
    body_trigram: body,
    use_trigram: use,
    hexagram: HEXAGRAM_NAMES[idx] ?? `${upper}${lower}`,
    relation: bodyUseRelation(body, use),
    interpretation_hint: '体用生克定吉凶，动爻为机',
  };
}

export function meihuaByTime(asOf: Date): MeihuaChart {
  const a = asOf.getFullYear() + asOf.getMonth() + 1;
  const b = asOf.getDate();
  const c = asOf.getHours();
  return { ...meihuaByNumbers(a, b, c), method: 'time' };
}

const WUXING: Record<string, string> = {
  乾: '金', 兑: '金', 离: '火', 震: '木', 巽: '木', 坎: '水', 艮: '土', 坤: '土',
};

function bodyUseRelation(body: string, use: string): string {
  const b = WUXING[body] ?? '土';
  const u = WUXING[use] ?? '土';
  const sheng: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const ke: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  if (b === u) return '比和';
  if (sheng[b] === u) return '体生用（泄）';
  if (sheng[u] === b) return '用生体（吉）';
  if (ke[b] === u) return '体克用（吉）';
  if (ke[u] === b) return '用克体（凶）';
  return '平和';
}
