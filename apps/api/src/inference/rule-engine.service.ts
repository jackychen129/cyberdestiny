import { Injectable } from '@nestjs/common';
import {
  pillarToString,
  branchesClash,
  branchesCombine,
} from '@cyberdestiny/chart-engine';
import type { BaziChart } from '@cyberdestiny/chart-engine';

export interface RuleEngineResult {
  wuxing_summary: string;
  day_master: string;
  day_master_element: string;
  favorable_elements: string[];
  unfavorable_elements: string[];
  clashes: string[];
  combines: string[];
  branch_relations: string[];
  ten_god_hints: string[];
  strength_note: string;
  basis: string[];
}

const STEM_ELEMENT: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土',
  庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const GENERATING: Record<string, string> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};

const CONTROLLING: Record<string, string> = {
  木: '土', 火: '金', 土: '水', 金: '木', 水: '火',
};

/** 十神简表：日干 vs 他干 */
const TEN_GOD: Record<string, Record<string, string>> = {
  木: { 木: '比劫', 火: '食伤', 土: '财星', 金: '官杀', 水: '印星' },
  火: { 火: '比劫', 土: '食伤', 金: '财星', 水: '官杀', 木: '印星' },
  土: { 土: '比劫', 金: '食伤', 水: '财星', 木: '官杀', 火: '印星' },
  金: { 金: '比劫', 水: '食伤', 木: '财星', 火: '官杀', 土: '印星' },
  水: { 水: '比劫', 木: '食伤', 火: '财星', 土: '官杀', 金: '印星' },
};

const PILLAR_LABELS = ['年', '月', '日', '时'] as const;

@Injectable()
export class RuleEngineService {
  analyze(chart: BaziChart, natal?: BaziChart): RuleEngineResult {
    const dayMaster = pillarToString(chart.day).charAt(0);
    const element = STEM_ELEMENT[dayMaster] ?? '土';
    const favorable = [GENERATING[element], element].filter(Boolean) as string[];
    const unfavorable = [CONTROLLING[element]].filter(Boolean) as string[];

    const pillars = [chart.year, chart.month, chart.day, chart.hour];
    const clashes: string[] = [];
    const combines: string[] = [];
    const branchRelations: string[] = [];

    for (let i = 0; i < pillars.length; i++) {
      for (let j = i + 1; j < pillars.length; j++) {
        const a = pillars[i]!;
        const b = pillars[j]!;
        const labelA = PILLAR_LABELS[i] + '支' + a.branch;
        const labelB = PILLAR_LABELS[j] + '支' + b.branch;
        if (branchesClash(a.branch_index, b.branch_index)) {
          const desc = labelA + '冲' + labelB;
          clashes.push(desc);
          branchRelations.push(desc + '，气机激荡，宜稳不宜冒进');
        }
        if (branchesCombine(a.branch_index, b.branch_index)) {
          const desc = labelA + '合' + labelB;
          combines.push(desc);
          branchRelations.push(desc + '，气机相融，利于合作与内省');
        }
      }
    }

    const tenGodHints: string[] = [];
    for (let i = 0; i < pillars.length; i++) {
      if (i === 2) continue;
      const stem = pillars[i]!.stem;
      const stemEl = STEM_ELEMENT[stem] ?? '土';
      const god = TEN_GOD[element]?.[stemEl];
      if (god) {
        tenGodHints.push(PILLAR_LABELS[i] + '干' + stem + '为' + god + '（相对日主' + dayMaster + '）');
      }
    }

    let strengthNote = '日主' + dayMaster + '属' + element;
    const monthBranch = chart.month.branch_index;
    const seasonStrength: Record<number, string> = {
      2: '木', 3: '木', 5: '火', 6: '火', 8: '土', 9: '土',
      11: '水', 0: '水', 10: '金', 7: '金',
    };
    const seasonEl = seasonStrength[monthBranch];
    if (seasonEl === element) strengthNote += '，得月令之气偏旺';
    else if (seasonEl && CONTROLLING[seasonEl] === element) strengthNote += '，受月令所克，宜借印比扶助';
    else strengthNote += '，月令非旺相，宜观大运流年补益';

    if (natal && natal !== chart) {
      const dayBranch = chart.day.branch_index;
      const natalDayBranch = natal.day.branch_index;
      if (branchesClash(dayBranch, natalDayBranch)) {
        branchRelations.push('流日冲本命日支，当日宜守不宜攻');
      }
      if (branchesCombine(dayBranch, natalDayBranch)) {
        branchRelations.push('流日合本命日支，当日气机与命盘呼应');
      }
    }

    const wuxingSummary =
      '日主' + dayMaster + '属' + element +
      (clashes.length ? '，见' + clashes.length + '组冲' : '') +
      (combines.length ? '，见' + combines.length + '组合' : '') +
      '，气机以' + element + '为中心运转';

    const basis = [
      'chart_step:day_pillar:' + pillarToString(chart.day),
      'wuxing:day_master:' + element,
      ...clashes.map((c) => 'chart_step:clash:' + c),
      ...combines.map((c) => 'chart_step:combine:' + c),
    ];

    return {
      wuxing_summary: wuxingSummary,
      day_master: dayMaster,
      day_master_element: element,
      favorable_elements: [...new Set(favorable)],
      unfavorable_elements: unfavorable,
      clashes,
      combines,
      branch_relations: branchRelations,
      ten_god_hints: tenGodHints,
      strength_note: strengthNote,
      basis,
    };
  }
}
