import { getYearPillar } from '../bazi/ganzhi';
import { pillarToString } from '../bazi/ganzhi-utils';

/** 九宫飞星方位（简化：以流年地支定中宫入星） */
const DIRECTIONS = ['北', '西南', '东', '东南', '中', '西北', '西', '东北', '南'] as const;

const STAR_NAMES = ['一白', '二黑', '三碧', '四绿', '五黄', '六白', '七赤', '八白', '九紫'] as const;

export interface FlyingStarCell {
  direction: string;
  star: string;
  star_index: number;
  auspicious: 'good' | 'neutral' | 'caution';
}

export interface FengshuiLayout {
  year: number;
  year_pillar: string;
  center_star: string;
  grid: FlyingStarCell[];
  favorable_directions: string[];
  caution_directions: string[];
}

const GOOD_STARS = new Set([1, 4, 6, 8, 9]);
const CAUTION_STARS = new Set([2, 5, 7]);

export function computeFlyingStars(year: number, favorableElements: string[] = []): FengshuiLayout {
  const yearPillar = getYearPillar(new Date(`${year}-06-01T12:00:00+08:00`));
  const centerIndex = (yearPillar.branch_index % 9) + 1;

  const grid: FlyingStarCell[] = DIRECTIONS.map((dir, i) => {
    const starIdx = ((centerIndex - 1 + i) % 9) + 1;
    const auspicious = CAUTION_STARS.has(starIdx)
      ? 'caution'
      : GOOD_STARS.has(starIdx)
        ? 'good'
        : 'neutral';
    return {
      direction: dir,
      star: STAR_NAMES[starIdx - 1] ?? '五黄',
      star_index: starIdx,
      auspicious,
    };
  });

  const elementDirection: Record<string, string> = {
    木: '东',
    火: '南',
    土: '中',
    金: '西',
    水: '北',
  };

  const favorable_directions = favorableElements
    .map((e) => elementDirection[e])
    .filter(Boolean) as string[];

  const caution_directions = grid.filter((c) => c.auspicious === 'caution').map((c) => c.direction);

  return {
    year,
    year_pillar: pillarToString(yearPillar),
    center_star: STAR_NAMES[centerIndex - 1] ?? '五黄',
    grid,
    favorable_directions,
    caution_directions,
  };
}
