import { describe, it, expect } from 'vitest';
import {
  computeDaYun,
  computeAge,
  analyzePair,
  computeBaziChart,
  computeFlyingStars,
  computeAlmanac,
} from './index';

describe('Da Yun', () => {
  it('generates 8 cycles', () => {
    const chart = computeBaziChart({
      datetime: '1990-05-05T12:00:00+08:00',
      hour_known: true,
    });
    const dayun = computeDaYun(chart.month, chart.year.stem_index, 'male');
    expect(dayun.cycles).toHaveLength(8);
    expect(dayun.start_age).toBeGreaterThanOrEqual(3);
  });

  it('computes age correctly', () => {
    const birth = new Date('1990-05-05');
    const asOf = new Date('2026-06-29');
    expect(computeAge(birth, asOf)).toBe(36);
  });
});

describe('Pair analysis', () => {
  it('returns compatibility score', () => {
    const a = computeBaziChart({ datetime: '1990-05-05T12:00:00+08:00', hour_known: true });
    const b = computeBaziChart({ datetime: '1992-08-15T08:00:00+08:00', hour_known: true });
    const result = analyzePair(a, b);
    expect(result.compatibility_score).toBeGreaterThan(0);
    expect(result.compatibility_score).toBeLessThanOrEqual(95);
    expect(result.basis.length).toBeGreaterThan(0);
  });
});

describe('Fengshui & Almanac', () => {
  it('computes flying stars grid', () => {
    const layout = computeFlyingStars(2026, ['木', '水']);
    expect(layout.grid).toHaveLength(9);
    expect(layout.year_pillar).toBeTruthy();
  });

  it('computes daily almanac', () => {
    const day = computeAlmanac(new Date('2026-06-29'));
    expect(day.yi.length).toBeGreaterThan(0);
    expect(day.ji.length).toBeGreaterThan(0);
  });
});
