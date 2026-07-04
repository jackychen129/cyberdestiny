import type { BaziChart } from '../types';
import {
  branchesClash,
  branchesCombine,
  pillarToString,
} from './ganzhi-utils';

export interface PairAnalysis {
  person_a: { day_master: string; day_pillar: string };
  person_b: { day_master: string; day_pillar: string };
  day_master_relation: string;
  branch_relations: string[];
  compatibility_score: number;
  strengths: string[];
  cautions: string[];
  basis: string[];
}

const STEM_ELEMENTS: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土',
  庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const GENERATES: Record<string, string> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};

const CONTROLS: Record<string, string> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
};

export function analyzePair(chartA: BaziChart, chartB: BaziChart): PairAnalysis {
  const dmA = chartA.day.stem;
  const dmB = chartB.day.stem;
  const elA = STEM_ELEMENTS[dmA] ?? '土';
  const elB = STEM_ELEMENTS[dmB] ?? '土';

  const branchRelations: string[] = [];
  let score = 60;

  if (branchesCombine(chartA.day.branch_index, chartB.day.branch_index)) {
    branchRelations.push('日支六合，气机相融');
    score += 15;
  }
  if (branchesClash(chartA.day.branch_index, chartB.day.branch_index)) {
    branchRelations.push('日支相冲，宜求同存异');
    score -= 10;
  }
  if (branchesCombine(chartA.year.branch_index, chartB.year.branch_index)) {
    branchRelations.push('年支相合，根基有助');
    score += 8;
  }

  let dmRelation = '日主五行并立';
  if (elA === elB) {
    dmRelation = '日主同气，易共鸣亦易竞争';
    score += 5;
  } else if (GENERATES[elA] === elB) {
    dmRelation = `A生B（${elA}生${elB}），一方付出一方受益`;
    score += 10;
  } else if (GENERATES[elB] === elA) {
    dmRelation = `B生A（${elB}生${elA}），一方扶持一方`;
    score += 10;
  } else if (CONTROLS[elA] === elB) {
    dmRelation = `A克B（${elA}克${elB}），需留意节奏`;
    score -= 5;
  } else if (CONTROLS[elB] === elA) {
    dmRelation = `B克A（${elB}克${elA}），需留意节奏`;
    score -= 5;
  }

  score = Math.min(95, Math.max(35, score));

  return {
    person_a: { day_master: dmA, day_pillar: pillarToString(chartA.day) },
    person_b: { day_master: dmB, day_pillar: pillarToString(chartB.day) },
    day_master_relation: dmRelation,
    branch_relations: branchRelations,
    compatibility_score: score,
    strengths: score >= 70 ? ['五行互补或气机相合', '宜分工协作'] : ['可借差异取长补短'],
    cautions: score < 60 ? ['沟通成本可能较高', '重大决策宜各退一步'] : ['保持边界与尊重'],
    basis: [
      `chart_step:pair_day:${pillarToString(chartA.day)}_${pillarToString(chartB.day)}`,
      `wuxing:a:${elA}`,
      `wuxing:b:${elB}`,
    ],
  };
}
