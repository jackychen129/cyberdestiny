import { computeBaziChart } from '../bazi/index';
import type { ChartEngineInput } from '../types';
import { mod } from '../bazi/ganzhi-utils';
import { EARTHLY_BRANCHES } from '../types';

export interface ZiweiPalace {
  name: string;
  branch: string;
  stars: string[];
  is_ming: boolean;
  is_shen: boolean;
}

export interface ZiweiChart {
  gender: 'male' | 'female' | 'unknown';
  ming_palace: string;
  shen_palace: string;
  wuxing_ju: string;
  palaces: ZiweiPalace[];
  major_star_summary: string;
  engine_version: string;
}

const PALACE_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'] as const;
const MAJOR_STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];

export function computeZiweiChart(input: ChartEngineInput & { gender?: 'male' | 'female' | 'unknown' }): ZiweiChart {
  const bazi = computeBaziChart(input);
  const dt = new Date(bazi.corrected_datetime);
  const month = dt.getMonth() + 1;
  const hourBranch = bazi.hour.branch_index;

  const mingIdx = mod(2 + (month - 1) - hourBranch, 12);
  const shenIdx = mod(mingIdx + 6, 12);
  const wuxingJu = ['水二局', '木三局', '金四局', '土五局', '火六局'][bazi.year.branch_index % 5]!;

  const palaces: ZiweiPalace[] = PALACE_NAMES.map((name, i) => {
    const palaceBranchIdx = mod(mingIdx + i, 12);
    const branch = EARTHLY_BRANCHES[palaceBranchIdx]!;
    const stars: string[] = [];
    if (i === 0) stars.push(MAJOR_STARS[bazi.day.branch_index % MAJOR_STARS.length]!);
    if (palaceBranchIdx === bazi.day.branch_index) stars.push('天府');
    if ((palaceBranchIdx + month) % 3 === 0) stars.push('天机');
    if ((palaceBranchIdx + hourBranch) % 4 === 0) stars.push('太阳');
    if (stars.length === 0) stars.push(MAJOR_STARS[(palaceBranchIdx + month) % MAJOR_STARS.length]!);
    return {
      name,
      branch,
      stars: [...new Set(stars)],
      is_ming: i === 0,
      is_shen: mod(mingIdx + i, 12) === shenIdx,
    };
  });

  const mingStars = palaces[0]?.stars ?? [];
  return {
    gender: input.gender ?? 'unknown',
    ming_palace: `${PALACE_NAMES[0]}（${palaces[0]?.branch}）`,
    shen_palace: `${PALACE_NAMES[mod(shenIdx - mingIdx, 12)]}（${EARTHLY_BRANCHES[shenIdx]}）`,
    wuxing_ju: wuxingJu,
    palaces,
    major_star_summary: mingStars.join('、') || '紫微',
    engine_version: bazi.engine_version,
  };
}
