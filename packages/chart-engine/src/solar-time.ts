import type { TrueSolarTimeInput, TrueSolarTimeResult } from './types';

const ENGINE_VERSION = '0.1.0';

/**
 * 真太阳时校正 stub。
 * Phase 0: 有经度时按经度差估算偏移；无经度则原样返回并标注未校正。
 */
export function correctTrueSolarTime(input: TrueSolarTimeInput): TrueSolarTimeResult {
  const dt = new Date(input.datetime);
  if (Number.isNaN(dt.getTime())) {
    throw new Error(`Invalid datetime: ${input.datetime}`);
  }

  if (input.longitude === undefined) {
    return {
      corrected_datetime: input.datetime,
      offset_minutes: 0,
      applied: false,
      note: '未提供经度，跳过真太阳时校正',
    };
  }

  // 东经120°为中国标准时基准
  const standardMeridian = 120;
  const offsetMinutes = Math.round((input.longitude - standardMeridian) * 4);
  const corrected = new Date(dt.getTime() + offsetMinutes * 60 * 1000);

  return {
    corrected_datetime: corrected.toISOString(),
    offset_minutes: offsetMinutes,
    applied: true,
    note: `经度 ${input.longitude}°，偏移 ${offsetMinutes} 分钟`,
  };
}

export { ENGINE_VERSION };
