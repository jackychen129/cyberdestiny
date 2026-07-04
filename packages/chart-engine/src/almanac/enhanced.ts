import { getDayPillar, getHourPillar } from '../bazi/ganzhi';
import { pillarToString } from '../bazi/ganzhi-utils';
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from '../types';
import { computeAlmanac, type AlmanacDay } from './index';

export interface EnhancedAlmanac extends AlmanacDay {
  jianchu: string;
  pengzu_stem: string;
  pengzu_branch: string;
  lucky_direction: string;
  hourly: { branch: string; label: string; yi: boolean }[];
  jishen: string[];
  xiongsha: string[];
}

const JIANCHU = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];
const PENGZU_STEM = ['甲不开仓', '乙不栽植', '丙不修灶', '丁不剃头', '戊不受田', '己不破券', '庚不经络', '辛不合酱', '壬不泱水', '癸不词讼'];
const PENGZU_BRANCH = ['子不问卜', '丑不冠带', '寅不祭祀', '卯不穿井', '辰不哭泣', '巳不远行', '午不苫盖', '未不服药', '申不安床', '酉不会客', '戌不吃犬', '亥不嫁娶'];
const DIRECTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北'];

export function computeEnhancedAlmanac(date: Date): EnhancedAlmanac {
  const base = computeAlmanac(date);
  const dayPillar = getDayPillar(date);
  const jianchu = JIANCHU[dayPillar.branch_index]!;

  const hourly = EARTHLY_BRANCHES.map((branch, i) => {
    const hp = getHourPillar(new Date(date.getFullYear(), date.getMonth(), date.getDate(), i * 2), dayPillar.stem_index);
    const seed = (dayPillar.branch_index + i) % 3;
    return { branch, label: pillarToString(hp), yi: seed !== 0 };
  });

  const seed = dayPillar.stem_index + dayPillar.branch_index;
  const jishen = ['天德', '月德', '三合', '六合'].filter((_, i) => (seed + i) % 2 === 0);
  const xiongsha = ['月破', '五离'].filter((_, i) => (seed + i) % 3 === 0);

  return {
    ...base,
    jianchu,
    pengzu_stem: PENGZU_STEM[dayPillar.stem_index]!,
    pengzu_branch: PENGZU_BRANCH[dayPillar.branch_index]!,
    lucky_direction: DIRECTIONS[seed % DIRECTIONS.length]!,
    hourly,
    jishen,
    xiongsha,
  };
}
