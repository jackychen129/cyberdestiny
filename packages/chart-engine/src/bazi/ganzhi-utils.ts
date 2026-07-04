import { HEAVENLY_STEMS, EARTHLY_BRANCHES, type HeavenlyStem, type EarthlyBranch, type Pillar } from '../types';

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function makePillarFromIndices(stemIndex: number, branchIndex: number): Pillar {
  return {
    stem: HEAVENLY_STEMS[mod(stemIndex, 10)] as HeavenlyStem,
    branch: EARTHLY_BRANCHES[mod(branchIndex, 12)] as EarthlyBranch,
    stem_index: mod(stemIndex, 10),
    branch_index: mod(branchIndex, 12),
  };
}

export function pillarToString(pillar: Pillar): string {
  return `${pillar.stem}${pillar.branch}`;
}

/** 地支六冲 */
export const BRANCH_CLASH: Record<number, number> = {
  0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3, 4: 10, 10: 4, 5: 11, 11: 5,
};

/** 地支六合 */
export const BRANCH_COMBINE: Record<number, number> = {
  0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6,
};

export function branchesClash(a: number, b: number): boolean {
  return BRANCH_CLASH[a] === b;
}

export function branchesCombine(a: number, b: number): boolean {
  return BRANCH_COMBINE[a] === b;
}
