import { HEXAGRAM_NAMES, type HexagramChart, type HexagramLine } from '../types';

/**
 * 六爻起卦 skeleton — Phase 0 时间卦基础结构。
 * Phase 1+ 补全纳甲、世应、六亲、六神。
 */
export function castHexagramByTime(asOf: Date): HexagramChart {
  const seed =
    asOf.getFullYear() * 10000 +
    (asOf.getMonth() + 1) * 100 +
    asOf.getDate() * 10 +
    Math.floor(asOf.getHours() / 2);

  const lines: HexagramLine[] = [];
  for (let i = 0; i < 6; i++) {
    const val = (seed >> i) & 1;
    const moving = ((seed >> (i + 6)) & 1) === 1;
    lines.push({
      position: i + 1,
      yin_yang: val === 0 ? 'yin' : 'yang',
      moving,
    });
  }

  const primaryIndex = seed % HEXAGRAM_NAMES.length;
  const changedIndex = (primaryIndex + lines.filter((l) => l.moving).length) % HEXAGRAM_NAMES.length;

  const hasMoving = lines.some((l) => l.moving);

  return {
    primary_hexagram: HEXAGRAM_NAMES[primaryIndex] ?? '乾为天',
    changed_hexagram: hasMoving ? (HEXAGRAM_NAMES[changedIndex] ?? '坤为地') : undefined,
    lines,
    method: 'time',
    skeleton: true,
  };
}

export function castHexagramByNumbers(numbers: [number, number, number]): HexagramChart {
  const [a, b, c] = numbers;
  const seed = a * 100 + b * 10 + c;

  const lines: HexagramLine[] = [];
  for (let i = 0; i < 6; i++) {
    const val = (seed >> i) & 1;
    lines.push({
      position: i + 1,
      yin_yang: val === 0 ? 'yin' : 'yang',
      moving: i === 2 || i === 5,
    });
  }

  const primaryIndex = seed % HEXAGRAM_NAMES.length;

  return {
    primary_hexagram: HEXAGRAM_NAMES[primaryIndex] ?? '乾为天',
    changed_hexagram: '变卦待完善',
    lines,
    method: 'number',
    skeleton: true,
  };
}

export function hexagramToRecord(chart: HexagramChart): Record<string, unknown> {
  return { ...chart };
}
