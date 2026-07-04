import {
  computeBaziChart,
  baziChartToRecord,
  computeDaYun,
  computeAge,
  getCurrentDaYun,
  computeFlyingStars,
  getZishiPracticeWindows,
  getDailyClassic,
  getYearPillar,
  pillarToString,
  resolveLongitude,
  type BaziChart,
} from '@cyberdestiny/chart-engine';
import { API_VERSION, type InferenceReport } from '@cyberdestiny/shared';
import type { RuleEngineService } from './rule-engine.service';
import type { LlmInterpreterService } from './llm-interpreter.service';
import { v4 as uuidv4 } from 'uuid';

export interface ScopeContext {
  profileId: string;
  profileName?: string;
  gender: 'male' | 'female' | 'unknown';
  birthDatetime: string;
  birthPlace?: string;
  longitude?: number;
  hourKnown: boolean;
  asOfDate: Date;
  question?: string;
  dailyClassic?: { title: string; content: string; basis: string };
}

export async function buildYearReport(
  ctx: ScopeContext,
  ruleEngine: RuleEngineService,
  interpreter: LlmInterpreterService,
): Promise<InferenceReport> {
  const natal = chartFor(ctx);
  const year = ctx.asOfDate.getFullYear();
  const yearPillar = getYearPillar(ctx.asOfDate);
  const rules = ruleEngine.analyze(natal);
  const fengshui = computeFlyingStars(year, rules.favorable_elements);

  const timeline = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 15);
    const monthChart = computeBaziChart({ datetime: d.toISOString(), hour_known: true });
    const monthRules = ruleEngine.analyze(monthChart);
    return {
      date: `${year}-${String(i + 1).padStart(2, '0')}`,
      label: `${i + 1}月 · ${pillarToString(monthChart.month)}`,
      tone: monthRules.clashes.length ? 'cautious' : 'favorable',
      note: monthRules.wuxing_summary,
    };
  });

  const interpreted = await interpreter.interpret({
    chart: natal,
    natalChart: natal,
    rules,
    scope: 'year',
    question: ctx.question,
    profileName: ctx.profileName,
    yearPillar: pillarToString(yearPillar),
  });

  const zishi = getZishiPracticeWindows(natal.day, rules.favorable_elements);
  const classic = ctx.dailyClassic ?? getDailyClassic(yearPillar.branch_index);

  return {
    report_id: uuidv4(),
    profile_id: ctx.profileId,
    scope: 'year',
    api_version: API_VERSION,
    as_of: ctx.asOfDate.toISOString(),
    summary: `${ctx.profileName ?? '命主'}的${year}年运：流年${pillarToString(yearPillar)}，太岁与命盘交会。${interpreted.summary}`,
    sections: [
      ...interpreted.sections,
      {
        title: '流年太岁',
        content: `${year}年干支${pillarToString(yearPillar)}，与日主${rules.day_master}形成年度主题。宜顺势而为，忌逆势硬扛。`,
        basis: [`chart_step:liunian:${pillarToString(yearPillar)}`, ...rules.basis],
        basis_type: 'chart_step',
      },
      {
        title: '九宫飞星',
        content: `流年中宫${fengshui.center_star}。吉方：${fengshui.favorable_directions.join('、') || '待定'}；慎方：${fengshui.caution_directions.join('、') || '无'}`,
        basis: ['fengshui:flying_star', `chart_step:year:${year}`],
        basis_type: 'chart_step',
      },
      {
        title: '每日一典',
        content: `${classic.title}：${classic.content}`,
        basis: [classic.basis],
        basis_type: 'classic',
      },
    ],
    timeline,
    recommendations: [
      ...interpreted.recommendations,
      `流年宜多向${fengshui.favorable_directions[0] ?? '东'}方行事`,
      '节气交替前后宜调整作息与计划',
    ],
    practice_hint: [
      ...interpreted.practice_hint,
      ...zishi.slice(0, 2).map((z) => `${z.branch}时（${z.hours}）：${z.practice}`),
    ],
    cautions: interpreted.cautions,
    confidence: ctx.hourKnown ? 0.78 : 0.62,
    missing_inputs: ctx.hourKnown ? [] : ['birth_hour'],
    attached_artifacts: {
      bazi_chart: { natal: baziChartToRecord(natal) },
      fengshui: fengshui as unknown as Record<string, unknown>,
    },
    practice_plan_id: null,
  };
}

export async function buildLifetimeReport(
  ctx: ScopeContext,
  ruleEngine: RuleEngineService,
  interpreter: LlmInterpreterService,
): Promise<InferenceReport> {
  const natal = chartFor(ctx);
  const rules = ruleEngine.analyze(natal);
  const birthDate = new Date(ctx.birthDatetime);
  const age = computeAge(birthDate, ctx.asOfDate);
  const dayun = computeDaYun(natal.month, natal.year.stem_index, ctx.gender);
  const currentYun = getCurrentDaYun(dayun, age);

  const interpreted = await interpreter.interpret({
    chart: natal,
    natalChart: natal,
    rules,
    scope: 'lifetime',
    question: ctx.question,
    profileName: ctx.profileName,
    currentDayun: currentYun?.pillar_label,
  });

  const dayunTimeline = dayun.cycles.map((c) => ({
    date: `${c.start_age}-${c.end_age}岁`,
    label: `第${c.index}运 ${c.pillar_label}`,
    tone: currentYun?.index === c.index ? 'favorable' : 'neutral',
    note: `大运${c.pillar_label}`,
  }));

  const recentYears = Array.from({ length: 5 }, (_, i) => {
    const y = ctx.asOfDate.getFullYear() - 2 + i;
    const d = new Date(`${y}-06-01T12:00:00+08:00`);
    const yp = getYearPillar(d);
    return {
      date: String(y),
      label: `流年 ${pillarToString(yp)}`,
      tone: 'neutral' as const,
    };
  });

  return {
    report_id: uuidv4(),
    profile_id: ctx.profileId,
    scope: 'lifetime',
    api_version: API_VERSION,
    as_of: ctx.asOfDate.toISOString(),
    summary: `${ctx.profileName ?? '命主'}一生格局：日主${rules.day_master}，喜${rules.favorable_elements.join('、')}。现年${age}岁，正行${currentYun?.pillar_label ?? '—'}大运。`,
    sections: [
      {
        title: '命格总论',
        content: interpreted.sections[0]?.content ?? rules.wuxing_summary,
        basis: rules.basis,
        basis_type: 'chart_step',
      },
      {
        title: '大运概览',
        content: `起运约${dayun.start_age}岁，${dayun.direction === 'forward' ? '顺行' : '逆行'}。当前${currentYun ? `第${currentYun.index}运（${currentYun.start_age}-${currentYun.end_age}岁）` : '尚未起运或童限'}`,
        basis: dayun.cycles.slice(0, 3).map((c) => `chart_step:dayun:${c.pillar_label}`),
        basis_type: 'chart_step',
      },
      {
        title: '修身方向',
        content: `五行喜${rules.favorable_elements.join('、')}，一生宜在相应方位、行业与作息中趋吉避凶。知命而后认命，认命而后改命。`,
        basis: ['classic:道德经-知命', ...rules.basis],
        basis_type: 'classic',
      },
    ],
    timeline: [...dayunTimeline, ...recentYears],
    recommendations: interpreted.recommendations,
    practice_hint: interpreted.practice_hint,
    cautions: interpreted.cautions,
    confidence: ctx.hourKnown ? 0.8 : 0.55,
    missing_inputs: ctx.hourKnown ? [] : ['birth_hour'],
    attached_artifacts: {
      bazi_chart: { natal: baziChartToRecord(natal), dayun },
    },
    practice_plan_id: null,
  };
}

function chartFor(ctx: ScopeContext): BaziChart {
  return computeBaziChart({
    datetime: ctx.birthDatetime,
    longitude: ctx.longitude,
    birth_place: ctx.birthPlace,
    hour_known: ctx.hourKnown,
  });
}
