import { describe, it, expect } from 'vitest';
import { computeBaziChart, pillarToString } from '../bazi/index';
import { correctTrueSolarTime } from '../solar-time';
import { castHexagramByTime } from '../liuyao/index';

describe('Bazi Chart Engine', () => {
  it('computes four pillars for a known datetime', () => {
    const chart = computeBaziChart({
      datetime: '1990-06-15T12:00:00+08:00',
      longitude: 104.06, // Chengdu
      hour_known: true,
    });

    expect(chart.year.stem).toBeDefined();
    expect(chart.month.stem).toBeDefined();
    expect(chart.day.stem).toBeDefined();
    expect(chart.hour.stem).toBeDefined();
    expect(pillarToString(chart.year)).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(chart.true_solar_applied).toBe(true);
    expect(chart.hour_known).toBe(true);
  });

  it('marks hour unknown when birth hour missing', () => {
    const chart = computeBaziChart({
      datetime: '1985-03-20T12:00:00+08:00',
      hour_known: false,
    });

    expect(chart.hour_known).toBe(false);
    expect(chart.true_solar_applied).toBe(false);
  });

  it('produces deterministic output for same input', () => {
    const input = {
      datetime: '2000-01-01T08:30:00+08:00',
      longitude: 116.4,
      hour_known: true,
    };
    const a = computeBaziChart(input);
    const b = computeBaziChart(input);

    expect(pillarToString(a.day)).toBe(pillarToString(b.day));
    expect(pillarToString(a.year)).toBe(pillarToString(b.year));
    expect(a.engine_version).toBe(b.engine_version);
  });
});

describe('True Solar Time', () => {
  it('applies longitude offset', () => {
    const result = correctTrueSolarTime({
      datetime: '2026-06-29T12:00:00+08:00',
      longitude: 104.06,
    });
    expect(result.applied).toBe(true);
    expect(result.offset_minutes).toBeLessThan(0); // west of 120°
  });
});

describe('Liuyao skeleton', () => {
  it('casts time hexagram with 6 lines', () => {
    const chart = castHexagramByTime(new Date('2026-06-29T08:00:00+08:00'));
    expect(chart.lines).toHaveLength(6);
    expect(chart.primary_hexagram).toBeTruthy();
    expect(chart.skeleton).toBe(true);
  });
});
