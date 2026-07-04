import type { Pillar } from '../types';
import { makePillarFromIndices, pillarToString } from './ganzhi-utils';

export interface DaYunCycle {
  index: number;
  start_age: number;
  end_age: number;
  pillar: Pillar;
  pillar_label: string;
}

export interface DaYunChart {
  direction: 'forward' | 'backward';
  start_age: number;
  cycles: DaYunCycle[];
}

const YANG_STEMS = new Set([0, 2, 4, 6, 8]);

/** 阳男阴女顺行，阴男阳女逆行 */
export function computeDaYun(
  monthPillar: Pillar,
  yearStemIndex: number,
  gender: 'male' | 'female' | 'unknown',
): DaYunChart {
  const yearYang = YANG_STEMS.has(yearStemIndex);
  const isMale = gender === 'male';
  const isFemale = gender === 'female';

  let forward = true;
  if (isMale) forward = yearYang;
  else if (isFemale) forward = !yearYang;
  // unknown: default forward

  const startAge = estimateStartAge(monthPillar.branch_index);
  const cycles: DaYunCycle[] = [];

  let stemIdx = monthPillar.stem_index;
  let branchIdx = monthPillar.branch_index;

  for (let i = 0; i < 8; i++) {
    if (forward) {
      stemIdx = (stemIdx + 1) % 10;
      branchIdx = (branchIdx + 1) % 12;
    } else {
      stemIdx = (stemIdx + 9) % 10;
      branchIdx = (branchIdx + 11) % 12;
    }

    const pillar = makePillarFromIndices(stemIdx, branchIdx);
    const ageStart = startAge + i * 10;
    cycles.push({
      index: i + 1,
      start_age: ageStart,
      end_age: ageStart + 9,
      pillar,
      pillar_label: pillarToString(pillar),
    });
  }

  return {
    direction: forward ? 'forward' : 'backward',
    start_age: startAge,
    cycles,
  };
}

/** 简化起运：以月支序估算 3–8 岁起运 */
function estimateStartAge(monthBranchIndex: number): number {
  return 3 + (monthBranchIndex % 6);
}

export function getCurrentDaYun(
  dayun: DaYunChart,
  age: number,
): DaYunCycle | undefined {
  return dayun.cycles.find((c) => age >= c.start_age && age <= c.end_age);
}

export function computeAge(birthDate: Date, asOf: Date): number {
  let age = asOf.getFullYear() - birthDate.getFullYear();
  const m = asOf.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < birthDate.getDate())) age--;
  return Math.max(0, age);
}
