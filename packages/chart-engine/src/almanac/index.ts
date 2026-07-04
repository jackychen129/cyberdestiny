import { getDayPillar, getYearPillar } from '../bazi/ganzhi';
import { pillarToString } from '../bazi/ganzhi-utils';

export interface AlmanacDay {
  date: string;
  lunar_label: string;
  day_pillar: string;
  year_pillar: string;
  yi: string[];
  ji: string[];
  solar_term?: string;
  dao_festival?: string;
}

const YI_POOL = ['祭祀', '祈福', '开市', '交易', '出行', '嫁娶', '动土', '修造', '纳财', '会友'];
const JI_POOL = ['破土', '安葬', '词讼', '开仓', '伐木', '远行', '动土', '嫁娶'];

const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
];

const DAO_FESTIVALS: Record<string, string> = {
  '01-15': '上元节',
  '07-15': '中元节',
  '10-15': '下元节',
};

export function computeAlmanac(date: Date): AlmanacDay {
  const dayPillar = getDayPillar(date);
  const yearPillar = getYearPillar(date);
  const iso = date.toISOString().slice(0, 10);
  const md = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const seed = dayPillar.stem_index * 12 + dayPillar.branch_index;
  const yi = pickItems(YI_POOL, seed, 4);
  const ji = pickItems(JI_POOL, seed + 7, 3);

  const termIndex = Math.floor(((date.getMonth() * 30 + date.getDate()) / 15) % 24);
  const solar_term = date.getDate() <= 2 || date.getDate() >= 28 ? SOLAR_TERMS[termIndex] : undefined;

  return {
    date: iso,
    lunar_label: `农历${date.getMonth() + 1}月${date.getDate()}日`,
    day_pillar: pillarToString(dayPillar),
    year_pillar: pillarToString(yearPillar),
    yi,
    ji,
    solar_term,
    dao_festival: DAO_FESTIVALS[md],
  };
}

function pickItems(pool: string[], seed: number, count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(seed + i * 3) % pool.length]!);
  }
  return [...new Set(result)];
}
