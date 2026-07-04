import type { BaziChart } from '@cyberdestiny/chart-engine';
import { pillarToString } from '@cyberdestiny/chart-engine';
import type { ReportSection } from '@cyberdestiny/shared';
import type { RuleEngineResult } from './rule-engine.service';

const SCOPE_LABELS: Record<string, string> = {
  day: '日运',
  week: '周运',
  year: '年运',
  lifetime: '一生格局',
};

/** 为各尺度运势生成更详细的结构化章节（模板层，LLM 可覆盖） */
export function buildFortuneDetailSections(
  scope: string,
  rules: RuleEngineResult,
  natal: BaziChart,
  extras?: {
    dayChart?: BaziChart;
    question?: string;
    profileName?: string;
    weekDays?: { date: string; pillar: string; tone: string; note: string }[];
    yearPillar?: string;
    currentDayun?: string;
  },
): ReportSection[] {
  const name = extras?.profileName ?? '命主';
  const scopeLabel = SCOPE_LABELS[scope] ?? scope;
  const dayMaster = rules.day_master;
  const favorable = rules.favorable_elements.join('、') || '木';
  const unfavorableMap: Record<string, string> = {
    木: '金', 火: '水', 土: '木', 金: '火', 水: '土',
  };
  const dmElement = rules.wuxing_summary.match(/属(.)/)?.[1] ?? '木';
  const unfavorable = unfavorableMap[dmElement] ?? '金';
  const natalDay = pillarToString(natal.day);
  const natalYear = pillarToString(natal.year);

  const sections: ReportSection[] = [
    {
      title: '命盘根基',
      content: [
        name + '本命日主为' + dayMaster + '，日柱' + natalDay + '，年柱' + natalYear + '。',
        '命局五行气势：' + rules.wuxing_summary + '。',
        '喜用神倾向：' + favorable + '；需留意过旺或受制：' + unfavorable + '。',
        '解读运势须先看命盘根基，再看流年、流日叠加后的气机变化。',
      ].join('\n'),
      basis: [...rules.basis, 'chart_step:natal_day:' + natalDay],
      basis_type: 'chart_step',
    },
    {
      title: '五行气机详解',
      content: [
        '当前' + scopeLabel + '以' + dayMaster + '为中心观察五行生克。',
        rules.clashes.length > 0
          ? '本期存在地支冲合：' + rules.clashes.join('、') + '，气机起伏较大，宜稳不宜急。'
          : '本期未见明显冲刑，气机相对平顺，可循序推进。',
        '宜扶' + favorable + '：可通过方位、作息、色彩与饮食微调；忌' + unfavorable + '过亢导致失衡。',
      ].join('\n'),
      basis: ['wuxing:summary:' + rules.wuxing_summary, ...rules.basis.slice(0, 3)],
      basis_type: 'chart_step',
    },
  ];

  if (rules.branch_relations && rules.branch_relations.length > 0) {
    sections.push({
      title: '刑冲合害',
      content: rules.branch_relations.join('\n'),
      basis: [...rules.clashes, ...rules.combines].map((c) => 'chart_step:' + c),
      basis_type: 'chart_step',
    });
  }

  if (rules.ten_god_hints && rules.ten_god_hints.length > 0) {
    sections.push({
      title: '十神象意',
      content: rules.ten_god_hints.join('\n') + '\n' + (rules.strength_note ?? ''),
      basis: ['wuxing:ten_god', 'classic:滴天髓'],
      basis_type: 'chart_step',
    });
  }

  if (scope === 'day' && extras?.dayChart) {
    const dayPillar = pillarToString(extras.dayChart.day);
    sections.push(
      {
        title: '日柱交会',
        content: [
          '当日日柱' + dayPillar + '与本命日柱' + natalDay + '交会。',
          '日柱代表当日主旋律，与本命日主生克决定今日顺势或逆势。',
          extras.question
            ? '针对「' + extras.question + '」：宜先观日主是否得令、得地，再论吉凶。'
            : '无特定问事时，以修身、整理、沟通类事务为优先。',
        ].join('\n'),
        basis: ['chart_step:day_pillar:' + dayPillar, 'chart_step:natal_day:' + natalDay],
        basis_type: 'chart_step',
      },
      {
        title: '时辰节奏',
        content: [
          '子丑寅卯…各时辰气机不同。上午宜发起与决断，午后宜沟通与协作，傍晚宜复盘与收神。',
          '今日五行偏' + favorable + '，辰巳时（7-11 点）较利静坐与规划；申酉时（15-19 点）较利对外事务。',
          '若已知出生时辰，可结合本命时柱做更精细的子午流注参考。',
        ].join('\n'),
        basis: ['classic:子午流注', 'practice:顺时而为'],
        basis_type: 'classic',
      },
      {
        title: '象意深读',
        content: [
          '《道德经》云「致虚极，守静笃」——' + scopeLabel + '宜先收视返听，再行动。',
          '日主' + dayMaster + '当日宜「尽其天性」：发挥本性长处，避免逆势硬扛。',
          '吉凶不在单一神煞，而在整体气机是否流通、身心是否调和。',
        ].join('\n'),
        basis: ['classic:道德经-致虚极', 'chart_step:day_master:' + dayMaster],
        basis_type: 'classic',
      },
    );
  }

  if (scope === 'week' && extras?.weekDays?.length) {
    const favorableCount = extras.weekDays.filter((d) => d.tone === 'favorable').length;
    sections.push(
      {
        title: '七日气机脉络',
        content: [
          '本周七日扫描：' + favorableCount + ' 日气机较顺，' + (7 - favorableCount) + ' 日宜谨慎。',
          '周运呈波浪形，宜将重要事项安排在气机较顺之日，谨慎日做内省与整理。',
          extras.weekDays
            .map((d, i) => '第' + (i + 1) + '天（' + d.date + '）' + d.pillar + '：' + d.note)
            .join('\n'),
        ].join('\n\n'),
        basis: ['chart_step:week_seven_day_scan'],
        basis_type: 'chart_step',
      },
      {
        title: '本周主题与策略',
        content: [
          '以日主' + dayMaster + '论，本周整体宜「分段推进」：先稳后进，中段调整节奏，周末休整收神。',
          extras.question
            ? '关于「' + extras.question + '」：本周前半宜调研与铺垫，后半宜推进与沟通。'
            : '无特定问事时，本周适合梳理计划、维护关系、轻量试错。',
          '切忌在谨慎日一次性押注全部资源。',
        ].join('\n'),
        basis: ['wuxing:favorable:' + favorable, 'practice:知命认命'],
        basis_type: 'chart_step',
      },
    );
  }

  if (scope === 'year') {
    const yearPillar = extras?.yearPillar;
    sections.push(
      {
        title: '流年主题深读',
        content: [
          yearPillar
            ? yearPillar + '流年太岁与本命日主' + dayMaster + '形成年度主轴。'
            : '流年与本命日主' + dayMaster + '交会，全年宜顺势而为。',
          '流年管一年之大势：春生夏长、秋收冬藏，各季度宜有不同重心。',
          '太岁并非绝对吉凶，而是年度「主题」与「课题」的符号化表达。',
        ].join('\n'),
        basis: yearPillar ? ['chart_step:liunian:' + yearPillar] : rules.basis,
        basis_type: 'chart_step',
      },
      {
        title: '四季行事纲要',
        content: [
          '春（寅卯辰）：萌发之机，宜启动新项目、学习新知。',
          '夏（巳午未）：炎上之势，宜曝光、表达、对外拓展。',
          '秋（申酉戌）：收敛之机，宜收获、结算、优化流程。',
          '冬（亥子丑）：潜藏之机，宜休整、规划、内功修炼。',
        ].join('\n'),
        basis: ['classic:易经-四时', 'wuxing:seasonal'],
        basis_type: 'classic',
      },
    );
  }

  if (scope === 'lifetime') {
    const currentDayun = extras?.currentDayun;
    sections.push(
      {
        title: '命格总论深读',
        content: [
          '日主' + dayMaster + '定一生格局基调。日柱' + natalDay + '为自身，年柱' + natalYear + '为根基与社会环境。',
          '一生喜' + favorable + '、忌' + unfavorable + '过亢，需在漫长岁月中反复调和。',
          '大运十年一换，流年一年一易；命为体，运为用，二者合参方得全貌。',
        ].join('\n'),
        basis: rules.basis,
        basis_type: 'chart_step',
      },
      {
        title: '大运节奏',
        content: currentDayun
          ? '当前行' + currentDayun + '大运。大运决定十年主旋律，宜据此规划事业与修行节奏。'
          : '当前大运需结合年龄与排盘确定。大运顺逆影响行事缓急与机遇窗口。',
        basis: ['chart_step:dayun', 'classic:滴天髓'],
        basis_type: 'chart_step',
      },
      {
        title: '一生修行要义',
        content: [
          '知命：理解格局与局限，不妄求逆天改命。',
          '认命：接受当下处境，在约束中寻找自由。',
          '改命：通过行动、习惯与心性修炼，在符号体系内「尽其天性」。',
        ].join('\n'),
        basis: ['practice:知命认命改命', 'classic:道德经'],
        basis_type: 'classic',
      },
    );
  }

  return sections;
}
