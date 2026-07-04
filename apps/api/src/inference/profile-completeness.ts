import type { Profile } from '@cyberdestiny/shared';

/** 缺失字段 → 老百姓可读说明 */
export const MISSING_INPUT_GUIDE: Record<
  string,
  { label: string; impact: string; how: string; priority: 'critical' | 'high' | 'medium' }
> = {
  birth_hour: {
    label: '出生时辰（几点几分）',
    impact: '时柱缺失则无法准确判断格局、十神层次与晚运节奏，时辰占命盘权重约四分之一。',
    how: '查出生证明、问父母，或按重大人生事件反推时辰（需专业师辅助）。',
    priority: 'critical',
  },
  birth_place: {
    label: '出生地点（城市/区县）',
    impact: '无法计算真太阳时，east/west 经度差可导致时辰偏差，日柱也可能错位。',
    how: '填写出生地省市区，如「四川成都」；海外出生填当地城市。',
    priority: 'critical',
  },
  gender: {
    label: '性别',
    impact: '大运顺行或逆行由此而定，十年运势方向完全依赖性别与年干阴阳。',
    how: '选择男/女；不确定时选「未知」但年运精度下降。',
    priority: 'high',
  },
  longitude: {
    label: '出生地经度（精确）',
    impact: '仅有城市名时用地名库近似经度；手动经度可提升真太阳时到分钟级。',
    how: '地图选点或填写东经度数，如成都约 104.06。',
    priority: 'medium',
  },
  current_location: {
    label: '现居地',
    impact: '流年方位、气候宜忌与行事环境参考会偏泛，不利择日出行建议。',
    how: '填写当前常住城市。',
    priority: 'medium',
  },
  occupation: {
    label: '职业/行业',
    impact: '财官印食伤与事业、财路的对应解读难以「落到你身上」。',
    how: '如「教育」「互联网」「个体经营」等。',
    priority: 'medium',
  },
  question: {
    label: '问事主题',
    impact: '无具体问事时报告偏通用；有主题则十神、卦象可对题释象。',
    how: '推演时填写：事业、感情、健康、投资、学业等。',
    priority: 'medium',
  },
};

export function buildMissingInputs(profile: Profile, question?: string): string[] {
  const missing: string[] = [];
  if (!profile.birth_hour_known) missing.push('birth_hour');
  if (!profile.birth_place?.trim()) missing.push('birth_place');
  if (profile.gender === 'unknown') missing.push('gender');
  if (!profile.current_location?.trim()) missing.push('current_location');
  if (!profile.occupation?.trim()) missing.push('occupation');
  if (!question?.trim()) missing.push('question');
  return missing;
}

export function confidenceFromMissing(missing: string[]): number {
  if (missing.length === 0) return 0.92;
  const weights: Record<string, number> = {
    birth_hour: 0.22,
    birth_place: 0.15,
    gender: 0.12,
    longitude: 0.05,
    current_location: 0.04,
    occupation: 0.04,
    question: 0.03,
  };
  let penalty = 0;
  for (const key of missing) {
    penalty += weights[key] ?? 0.03;
  }
  return Math.max(0.35, 0.92 - penalty);
}

export function buildCompletenessSection(missing: string[]): {
  title: string;
  content: string;
  basis: string[];
} {
  if (missing.length === 0) {
    return {
      title: '信息完整度',
      content:
        '当前档案信息较完整，已启用真太阳时、性别大运与问事上下文。报告置信度较高，宜结合各章行动建议顺时而为。',
      basis: ['profile:complete'],
    };
  }

  const lines = missing.map((key, i) => {
    const g = MISSING_INPUT_GUIDE[key];
    if (!g) return `${i + 1}. 补充 ${key}`;
    return [
      `${i + 1}. 【${g.label}】`,
      `影响：${g.impact}`,
      `如何补充：${g.how}`,
    ].join('\n');
  });

  const critical = missing.filter((k) => MISSING_INPUT_GUIDE[k]?.priority === 'critical');

  return {
    title: '精准提升指引',
    content: [
      `为达到业内更全面的推演精度，建议补充以下 ${missing.length} 项（${critical.length} 项为关键）：`,
      '',
      lines.join('\n\n'),
      '',
      '补全后重新推演，报告将更新 confidence 与章节详解。命理以「命盘为体、信息为据」——信息越完整，越能「窥见天机」而不失严谨。',
    ].join('\n'),
    basis: missing.map((m) => 'missing:' + m),
  };
}

export function displayProfileName(name?: string | null): string {
  return name?.trim() ? name.trim() : '匿名命主';
}
