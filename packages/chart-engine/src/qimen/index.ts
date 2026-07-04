import { getDayPillar, getHourPillar } from '../bazi/ganzhi';
import { makePillarFromIndices, pillarToString } from '../bazi/ganzhi-utils';

export interface QimenChart {
  datetime: string;
  day_pillar: string;
  hour_pillar: string;
  dun: '阳遁' | '阴遁';
  ju: number;
  palaces: { position: number; door: string; star: string; deity: string; stem: string }[];
  interpretation_hint: string;
}

const DOORS = ['休', '生', '伤', '杜', '景', '死', '惊', '开'];
const STARS = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];
const DEITIES = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];

export function computeQimen(datetime: string): QimenChart {
  const dt = new Date(datetime);
  const day = getDayPillar(dt);
  const hour = getHourPillar(dt, day.stem_index);
  const seed = day.stem_index * 12 + day.branch_index + hour.branch_index;
  const ju = (seed % 9) + 1;
  const dun = dt.getMonth() + 1 <= 6 ? '阳遁' : '阴遁';

  const palaces = [];
  for (let i = 0; i < 9; i++) {
    palaces.push({
      position: i + 1,
      door: DOORS[(seed + i) % DOORS.length]!,
      star: STARS[(seed + i * 2) % STARS.length]!,
      deity: DEITIES[(seed + i) % DEITIES.length]!,
      stem: pillarToString(makePillarFromIndices(day.stem_index + i, (hour.branch_index + i) % 12)),
    });
  }

  return {
    datetime: dt.toISOString(),
    day_pillar: pillarToString(day),
    hour_pillar: pillarToString(hour),
    dun,
    ju,
    palaces,
    interpretation_hint: '奇门以用时为枢，门星神配合论事',
  };
}
