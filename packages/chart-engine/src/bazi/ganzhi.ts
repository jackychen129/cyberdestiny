import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  type HeavenlyStem,
  type EarthlyBranch,
  type Pillar,
} from '../types';

/** 月支起始：寅月（立春后） */
const MONTH_BRANCH_START = 2; // 寅 index

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function makePillar(stemIndex: number, branchIndex: number): Pillar {
  return {
    stem: HEAVENLY_STEMS[mod(stemIndex, 10)] as HeavenlyStem,
    branch: EARTHLY_BRANCHES[mod(branchIndex, 12)] as EarthlyBranch,
    stem_index: mod(stemIndex, 10),
    branch_index: mod(branchIndex, 12),
  };
}

/**
 * 计算日柱 — 基于儒略日数算法（蔡勒变体，1900-2100 适用）
 * 参考：六十甲子日序，以 1900-01-01 为基准日（甲戌日 stem=0 branch=10）
 */
export function getDayPillar(date: Date): Pillar {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();

  // 儒略日数（简化）
  let a = Math.floor((14 - m) / 12);
  let y2 = y + 4800 - a;
  let m2 = m + 12 * a - 3;
  let jdn =
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045;

  // 1900-01-31 甲子日 jdn 基准校正
  const baseJdn = 2415021; // 1900-01-01
  const dayOffset = jdn - baseJdn;

  // 1900-01-01 是 甲戌日 (stem=0, branch=10)
  const stemIndex = mod(dayOffset + 0, 10);
  const branchIndex = mod(dayOffset + 10, 12);

  return makePillar(stemIndex, branchIndex);
}

/**
 * 年柱 — 以立春为界（stub: 公历 2 月 4 日近似）
 */
export function getYearPillar(date: Date): Pillar {
  let year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // 立春近似 2月4日
  if (month < 2 || (month === 2 && day < 4)) {
    year -= 1;
  }
  // 1984 甲子年
  const stemIndex = mod(year - 1984, 10);
  const branchIndex = mod(year - 1984, 12);
  return makePillar(stemIndex, branchIndex);
}

/**
 * 月柱 — 五虎遁月法
 */
export function getMonthPillar(date: Date, yearStemIndex: number): Pillar {
  let month = date.getMonth() + 1;
  const day = date.getDate();
  // 节气近似：每月 6 日换月支（stub，Phase 1 用精确节气表）
  const solarMonthBranches = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]; // 寅月起
  let branchIndex = solarMonthBranches[month - 1] ?? 2;
  if (day < 6 && month > 1) {
    branchIndex = solarMonthBranches[month - 2] ?? branchIndex;
  }

  // 五虎遁：年干定寅月天干
  const monthStemBase = [2, 4, 6, 8, 0][mod(yearStemIndex, 5)] ?? 2;
  const monthOffset = mod(branchIndex - MONTH_BRANCH_START, 12);
  const stemIndex = mod(monthStemBase + monthOffset, 10);

  return makePillar(stemIndex, branchIndex);
}

/**
 * 时柱 — 五鼠遁时法
 */
export function getHourPillar(date: Date, dayStemIndex: number): Pillar {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  // 子时 23:00-00:59
  let branchIndex: number;
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) {
    branchIndex = 0; // 子
  } else {
    branchIndex = Math.floor((totalMinutes - 60) / 120) + 1;
    branchIndex = Math.min(branchIndex, 11);
  }

  // 五鼠遁
  const hourStemBase = [0, 2, 4, 6, 8][mod(dayStemIndex, 5)] ?? 0;
  const stemIndex = mod(hourStemBase + branchIndex, 10);

  return makePillar(stemIndex, branchIndex);
}

export function pillarToString(pillar: Pillar): string {
  return `${pillar.stem}${pillar.branch}`;
}
