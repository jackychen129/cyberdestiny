/** 天干 Heavenly Stems */
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

/** 地支 Earthly Branches */
export const EARTHLY_BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const;

/** 八卦名 */
export const TRIGRAMS = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'] as const;

/** 六十四卦（简化索引，Phase 1+ 完整纳甲） */
export const HEXAGRAM_NAMES = [
  '乾为天',
  '坤为地',
  '水雷屯',
  '山水蒙',
  '水天需',
  '天水讼',
  '地水师',
  '水地比',
] as const;

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stem_index: number;
  branch_index: number;
}

export interface BaziChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  /** 校正后的真太阳时 ISO（stub 时与输入相同） */
  corrected_datetime: string;
  true_solar_applied: boolean;
  /** 缺时辰时为 false */
  hour_known: boolean;
  engine_version: string;
}

export interface TrueSolarTimeInput {
  datetime: string;
  longitude?: number;
  latitude?: number;
  timezone_offset_hours?: number;
}

export interface TrueSolarTimeResult {
  corrected_datetime: string;
  offset_minutes: number;
  applied: boolean;
  note?: string;
}

export interface HexagramLine {
  position: number;
  yin_yang: 'yin' | 'yang';
  moving: boolean;
}

export interface HexagramChart {
  primary_hexagram: string;
  changed_hexagram?: string;
  lines: HexagramLine[];
  method: 'time' | 'number' | 'manual';
  skeleton: boolean;
}

export interface ChartEngineInput {
  datetime: string;
  longitude?: number;
  latitude?: number;
  birth_place?: string;
  hour_known?: boolean;
}
