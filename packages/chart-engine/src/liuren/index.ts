import { getDayPillar, getHourPillar } from '../bazi/ganzhi';
import { pillarToString } from '../bazi/ganzhi-utils';
import { EARTHLY_BRANCHES } from '../types';

export interface LiurenChart {
  datetime: string;
  day_pillar: string;
  hour_pillar: string;
  yue_jiang: string;
  si_ke: { ke: number; upper: string; lower: string; relation: string }[];
  san_chuan: { chu: string; zhong: string; mo: string };
  interpretation_hint: string;
}

const YUE_JIANG = ['亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子'];

export function computeLiuren(datetime: string): LiurenChart {
  const dt = new Date(datetime);
  const day = getDayPillar(dt);
  const hour = getHourPillar(dt, day.stem_index);
  const yueIdx = dt.getMonth();
  const yue_jiang = YUE_JIANG[yueIdx]!;

  const si_ke = [1, 2, 3, 4].map((ke) => {
    const upper = EARTHLY_BRANCHES[(day.branch_index + ke) % 12]!;
    const lower = EARTHLY_BRANCHES[(hour.branch_index + ke) % 12]!;
    return { ke, upper, lower, relation: upper === lower ? '比' : '克' };
  });

  const seed = day.branch_index + hour.branch_index;
  const san_chuan = {
    chu: EARTHLY_BRANCHES[seed % 12]!,
    zhong: EARTHLY_BRANCHES[(seed + 4) % 12]!,
    mo: EARTHLY_BRANCHES[(seed + 8) % 12]!,
  };

  return {
    datetime: dt.toISOString(),
    day_pillar: pillarToString(day),
    hour_pillar: pillarToString(hour),
    yue_jiang,
    si_ke,
    san_chuan,
    interpretation_hint: '四课定象，三传别体用',
  };
}
