import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BaziChart } from '@cyberdestiny/chart-engine';
import type { RuleEngineResult } from './rule-engine.service';
import type { ReportSection } from '@cyberdestiny/shared';
import { buildFortuneDetailSections } from './fortune-detail';
import { KnowledgeService } from '../knowledge/knowledge.service';

export interface InterpreterInput {
  chart: BaziChart;
  rules: RuleEngineResult;
  scope: string;
  question?: string;
  profileName?: string;
  natalChart?: BaziChart;
  weekDays?: { date: string; pillar: string; tone: string; note: string }[];
  yearPillar?: string;
  currentDayun?: string;
}

export interface InterpreterOutput {
  summary: string;
  sections: ReportSection[];
  recommendations: string[];
  practice_hint: string[];
  cautions: string[];
}

/** LLM 释象层 — 无 API Key 时使用详细模板 */
@Injectable()
export class LlmInterpreterService {
  constructor(
    private readonly config: ConfigService,
    private readonly knowledge: KnowledgeService,
  ) {}

  async interpret(input: InterpreterInput): Promise<InterpreterOutput> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      const llm = await this.callLlm(input, apiKey);
      return this.mergeWithDetail(input, llm);
    }
    return this.mockInterpret(input);
  }

  private mergeWithDetail(input: InterpreterInput, llm: InterpreterOutput): InterpreterOutput {
    const detail = buildFortuneDetailSections(input.scope, input.rules, input.natalChart ?? input.chart, {
      dayChart: input.scope === 'day' ? input.chart : undefined,
      question: input.question,
      profileName: input.profileName,
      weekDays: input.weekDays,
      yearPillar: input.yearPillar,
      currentDayun: input.currentDayun,
    });
    const titles = new Set(llm.sections.map((s) => s.title));
    const merged = [...llm.sections, ...detail.filter((s) => !titles.has(s.title))];
    return { ...llm, sections: merged };
  }

  private async callLlm(input: InterpreterInput, apiKey: string): Promise<InterpreterOutput> {
    const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content:
                '你是 CyberDestiny 命理释象师。先释象后论吉凶。输出 JSON：summary, sections[{title,content,basis,basis_type}], recommendations, practice_hint, cautions。每章 content 至少 3 句，解释清楚「为什么」。',
            },
            {
              role: 'user',
              content: JSON.stringify({
                scope: input.scope,
                day_master: input.rules.day_master,
                wuxing: input.rules.wuxing_summary,
                question: input.question,
              }),
            },
          ],
        }),
      });
      if (!response.ok) return this.mockInterpret(input);
      const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content) as InterpreterOutput;
        } catch {
          return this.mockInterpret(input);
        }
      }
    } catch {
      /* fallback */
    }
    return this.mockInterpret(input);
  }

  private async mockInterpret(input: InterpreterInput): Promise<InterpreterOutput> {
    const { rules, scope, question } = input;
    const name = input.profileName ?? '命主';
    const natal = input.natalChart ?? input.chart;

    const detailSections = buildFortuneDetailSections(scope, rules, natal, {
      dayChart: scope === 'day' ? input.chart : undefined,
      question,
      profileName: name,
      weekDays: input.weekDays,
      yearPillar: input.yearPillar,
      currentDayun: input.currentDayun,
    });

    const dmElement = rules.wuxing_summary.match(/属(.)/)?.[1];
    const classics = await this.knowledge.resolveClassicsForInference({
      seed: input.chart.day.branch_index,
      dayMasterElement: dmElement,
      hasClash: rules.clashes.length > 0,
      scope,
      limit: 3,
    });

    const classicSection: ReportSection = {
      title: '典籍与天理',
      content: classics
        .map((c) => '「' + c.title + '」' + c.content)
        .join('\n\n'),
      basis: classics.map((c) => c.basis),
      basis_type: 'classic',
    };

    const modern = await this.knowledge.resolveModernContextForInference({
      seed: input.chart.day.branch_index,
      hasClash: rules.clashes.length > 0,
    });

    const modernSection: ReportSection = {
      title: '科学与时势',
      content: [
        '▎现代科学象意\n「' + modern.science.title + '」' + modern.science.content,
        modern.world_lines.length > 0
          ? '\n▎外部时势脉搏\n' + modern.world_lines.join('\n')
          : '',
        '\n▎' + modern.disclaimer,
      ].join(''),
      basis: [modern.science.basis, 'world:pulse', 'science:supplement'],
      basis_type: 'classic',
    };

    return {
      summary: `${name}的${scopeLabel(scope)}：${rules.wuxing_summary}。气机整体${rules.clashes.length ? '起伏' : '平稳'}，宜顺时而为、分段推进，详见下方各章详解。`,
      sections: [...detailSections, classicSection, modernSection],
      recommendations: scopeRecommendations(scope, rules),
      practice_hint: [
        '辰时静坐 10–15 分钟，收视返听',
        `多亲近${rules.favorable_elements[0] ?? '木'}气环境（方位、色彩、饮食）`,
        '傍晚轻行或散步，松驰身心',
      ],
      cautions: [
        '本报告为自我认知与文化学习参考，不构成医疗、法律或投资建议',
        '重大决策请结合现实信息与专业咨询',
        '单一日柱或神煞不可独断吉凶，须合参命盘与大运流年',
      ],
    };
  }
}

function scopeLabel(scope: string): string {
  const labels: Record<string, string> = {
    day: '日运',
    week: '周运',
    year: '年运',
    lifetime: '一生格局',
  };
  return labels[scope] ?? scope;
}

function scopeRecommendations(scope: string, rules: RuleEngineResult): string[] {
  const el = rules.favorable_elements[0] ?? '木';
  const base = [
    `上午处理需专注的事务，多扶${el}气`,
    '午后宜复盘、沟通与协作',
    '重大决定前宜静观三日，避免冲动',
  ];
  if (scope === 'week') {
    return [...base, '将关键事项安排在本周气机较顺之日', '周末留出休整与静坐时间'];
  }
  if (scope === 'year') {
    return [...base, '春分、夏至、秋分、冬至前后宜调整计划', '流年宜循序渐进，忌一次性孤注一掷'];
  }
  if (scope === 'lifetime') {
    return [...base, '按大运节奏规划十年主题', '修行与行动并重，知命而不认命'];
  }
  return base;
}
