import { correctTrueSolarTime, ENGINE_VERSION } from '../solar-time';
import {
  getYearPillar,
  getMonthPillar,
  getDayPillar,
  getHourPillar,
  pillarToString,
} from './ganzhi';
import type { BaziChart, ChartEngineInput } from '../types';

export function computeBaziChart(input: ChartEngineInput): BaziChart {
  const hourKnown = input.hour_known !== false;

  const solar = correctTrueSolarTime({
    datetime: input.datetime,
    longitude: input.longitude,
  });

  const dt = new Date(solar.corrected_datetime);
  if (Number.isNaN(dt.getTime())) {
    throw new Error(`Invalid datetime: ${input.datetime}`);
  }

  const year = getYearPillar(dt);
  const month = getMonthPillar(dt, year.stem_index);
  const day = getDayPillar(dt);

  const hour = hourKnown
    ? getHourPillar(dt, day.stem_index)
    : { stem: '甲' as const, branch: '子' as const, stem_index: 0, branch_index: 0 };

  return {
    year,
    month,
    day,
    hour,
    corrected_datetime: solar.corrected_datetime,
    true_solar_applied: solar.applied,
    hour_known: hourKnown,
    engine_version: ENGINE_VERSION,
  };
}

export function baziChartToRecord(chart: BaziChart): Record<string, unknown> {
  return {
    year_pillar: pillarToString(chart.year),
    month_pillar: pillarToString(chart.month),
    day_pillar: pillarToString(chart.day),
    hour_pillar: hourKnownLabel(chart),
    pillars: {
      year: chart.year,
      month: chart.month,
      day: chart.day,
      hour: chart.hour,
    },
    corrected_datetime: chart.corrected_datetime,
    true_solar_applied: chart.true_solar_applied,
    hour_known: chart.hour_known,
    engine_version: chart.engine_version,
  };
}

function hourKnownLabel(chart: BaziChart): string {
  if (!chart.hour_known) return '未知';
  return pillarToString(chart.hour);
}

export { pillarToString, getYearPillar, getMonthPillar, getDayPillar, getHourPillar } from './ganzhi';
