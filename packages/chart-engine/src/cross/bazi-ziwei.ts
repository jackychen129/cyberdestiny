import { computeBaziChart } from '../bazi/index';
import { computeShenSha } from '../bazi/shensha';
import { computeZiweiChart } from '../ziwei/index';
import type { ChartEngineInput } from '../types';

export interface BaziZiweiCrossReport {
  alignment_score: number;
  day_master: string;
  day_master_element: string;
  ziwei_ming_stars: string[];
  theme_alignment: string;
  life_window_notes: string[];
  conflicts: string[];
  strengths: string[];
  summary: string;
}

const STEM_ELEMENT: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const STAR_ELEMENT: Record<string, string> = {
  紫微: '土', 天机: '木', 太阳: '火', 武曲: '金', 天同: '水', 廉贞: '火', 天府: '土',
  太阴: '水', 贪狼: '木', 巨门: '水', 天相: '水', 天梁: '土', 七杀: '金', 破军: '水',
};

export function crossValidateBaziZiwei(input: ChartEngineInput & { gender?: 'male' | 'female' | 'unknown' }): BaziZiweiCrossReport {
  const bazi = computeBaziChart(input);
  const ziwei = computeZiweiChart(input);
  const shensha = computeShenSha(bazi);

  const dayMaster = bazi.day.stem;
  const dmEl = STEM_ELEMENT[dayMaster] ?? '土';
  const mingStars = ziwei.palaces.find((p) => p.is_ming)?.stars ?? [];
  const starEl = STAR_ELEMENT[mingStars[0] ?? '紫微'] ?? '土';

  let score = 55;
  const strengths: string[] = [];
  const conflicts: string[] = [];

  if (generates(dmEl, starEl)) {
    score += 15;
    strengths.push(`八字日主${dmEl}生紫微主星${starEl}气，主轴偏外放、可成`);
  } else if (generates(starEl, dmEl)) {
    score += 12;
    strengths.push(`紫微${starEl}生扶日主${dmEl}，气机有根`);
  } else if (dmEl === starEl) {
    score += 10;
    strengths.push('日主与命宫主星同气，性格主轴一致');
  } else if (controls(dmEl, starEl) || controls(starEl, dmEl)) {
    score -= 8;
    conflicts.push(`日主${dmEl}与命宫${starEl}有克，人生易有内在拉扯`);
  }

  if (shensha.some((s) => s.name === '天乙贵人')) {
    score += 8;
    strengths.push('八字带天乙，与紫微命格可互证贵人运');
  }
  if (shensha.some((s) => s.name === '驿马')) {
    strengths.push('驿马动，紫微迁移宫宜结合大运看变动');
  }

  score = Math.max(20, Math.min(95, score));

  return {
    alignment_score: score,
    day_master: dayMaster,
    day_master_element: dmEl,
    ziwei_ming_stars: mingStars,
    theme_alignment: score >= 70 ? '主轴一致' : score >= 50 ? '部分一致' : '需分论',
    life_window_notes: [
      `八字大运以${bazi.month.stem}${bazi.month.branch}月柱起运为参`,
      `紫微${ziwei.wuxing_ju}，大限顺逆依性别与年干`,
    ],
    conflicts,
    strengths,
    summary: `八字日主${dayMaster}（${dmEl}）与紫微命宫${mingStars.join('、')}对照，契合度约 ${score}%。${score >= 65 ? '两套体系主轴可互证。' : '宜分论：八字重气运，紫微重格局。'}`,
  };
}

function generates(a: string, b: string): boolean {
  const m: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  return m[a] === b;
}

function controls(a: string, b: string): boolean {
  const m: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  return m[a] === b;
}
