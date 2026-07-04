import { computeEnhancedAlmanac } from './enhanced';

export interface ZeriRequest {
  start_date: string;
  end_date: string;
  activity: 'marriage' | 'travel' | 'business' | 'moving' | 'general';
}

export interface ZeriDayScore {
  date: string;
  score: number;
  day_pillar: string;
  jianchu: string;
  yi: string[];
  ji: string[];
  recommendation: string;
}

const ACTIVITY_WEIGHTS: Record<string, { yi: string[]; avoid_jianchu: string[] }> = {
  marriage: { yi: ['嫁娶', '纳采', '会友'], avoid_jianchu: ['破', '闭', '危'] },
  travel: { yi: ['出行', '远行'], avoid_jianchu: ['破', '闭'] },
  business: { yi: ['开市', '交易', '纳财'], avoid_jianchu: ['破', '收'] },
  moving: { yi: ['移徙', '入宅', '修造'], avoid_jianchu: ['破', '闭'] },
  general: { yi: ['祈福', '祭祀'], avoid_jianchu: ['破'] },
};

export function computeZeri(req: ZeriRequest): ZeriDayScore[] {
  const start = new Date(req.start_date);
  const end = new Date(req.end_date);
  const weights = ACTIVITY_WEIGHTS[req.activity] ?? ACTIVITY_WEIGHTS.general!;
  const results: ZeriDayScore[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const alm = computeEnhancedAlmanac(new Date(d));
    let score = 50;
    for (const y of weights.yi) {
      if (alm.yi.includes(y)) score += 12;
    }
    if (weights.avoid_jianchu.includes(alm.jianchu)) score -= 25;
    if (alm.jianchu === '成' || alm.jianchu === '开') score += 10;
    if (alm.jianchu === '定') score += 8;
    score = Math.max(0, Math.min(100, score));

    results.push({
      date: alm.date,
      score,
      day_pillar: alm.day_pillar,
      jianchu: alm.jianchu,
      yi: alm.yi,
      ji: alm.ji,
      recommendation: score >= 70 ? '宜选用' : score >= 50 ? '可参用' : '慎用',
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
