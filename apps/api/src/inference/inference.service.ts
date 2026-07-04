import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import {
  computeBaziChart,
  baziChartToRecord,
  castHexagramByTime,
  hexagramToRecord,
  resolveLongitude,
  pillarToString,
  computeAlmanac,
  getYearPillar,
} from '@cyberdestiny/chart-engine';
import {
  API_VERSION,
  DestinyInferRequestSchema,
  type DestinyInferRequest,
  type DestinyInferResponse,
  type InferenceReport,
  type Profile,
  type ReportQaRequest,
  type ReportQaResponse,
  HexagramCastRequestSchema,
  type HexagramCastRequest,
  type HexagramResult,
} from '@cyberdestiny/shared';
import { DatabaseService } from '../database/database.service';
import { inferenceReports, hexagramCasts } from '../database/schema';
import { ProfileService } from '../profile/profile.service';
import { PracticeService } from '../practice/practice.service';
import { BillingService } from '../billing/billing.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { RuleEngineService } from './rule-engine.service';
import { LlmInterpreterService } from './llm-interpreter.service';
import { buildYearReport, buildLifetimeReport } from './scope-builders';
import {
  buildMissingInputs,
  buildCompletenessSection,
  confidenceFromMissing,
  displayProfileName,
} from './profile-completeness';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InferenceService {
  constructor(
    private readonly database: DatabaseService,
    private readonly profileService: ProfileService,
    private readonly practiceService: PracticeService,
    private readonly billing: BillingService,
    private readonly ruleEngine: RuleEngineService,
    private readonly interpreter: LlmInterpreterService,
    private readonly knowledge: KnowledgeService,
    private readonly config: ConfigService,
  ) {}

  async destinyInfer(request: DestinyInferRequest, apiKey?: string): Promise<DestinyInferResponse> {
    const parsed = DestinyInferRequestSchema.safeParse(request);
    if (!parsed.success) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    }

    const { profile_id, scope, question, as_of } = parsed.data;
    const cost = this.billing.inferCostForScope(scope);
    const remaining = await this.billing.deduct(apiKey, cost);

    let result: DestinyInferResponse;
    if (scope === 'year') {
      result = await this.yearScopeInfer(profile_id, as_of, question);
    } else if (scope === 'lifetime') {
      result = await this.lifetimeScopeInfer(profile_id, as_of, question);
    } else if (scope === 'week') {
      result = await this.weekScopeInfer(profile_id, as_of, question);
    } else {
      result = await this.dayScopeInfer(profile_id, as_of, question);
    }

    return { ...result, credits_remaining: remaining };
  }

  private async dayScopeInfer(
    profileId: string,
    asOf?: string,
    question?: string,
  ): Promise<DestinyInferResponse> {
    const profile = await this.profileService.findOne(profileId);
    const profileRow = await this.profileService.findRow(profileId);
    const asOfDate = asOf ? new Date(asOf) : new Date();

    const longitude = resolveLongitude(profile.birth_place, profileRow.longitude);

    const natalChart = computeBaziChart({
      datetime: profile.birth_datetime,
      longitude,
      birth_place: profile.birth_place,
      hour_known: profile.birth_hour_known,
    });

    const dayChart = computeBaziChart({
      datetime: asOfDate.toISOString(),
      hour_known: true,
    });

    const rules = this.ruleEngine.analyze(dayChart, natalChart);
    const interpreted = await this.interpreter.interpret({
      chart: dayChart,
      natalChart,
      rules,
      scope: 'day',
      question,
      profileName: displayProfileName(profile.name),
    });

    const missingInputs = buildMissingInputs(profile, question);
    const confidence = confidenceFromMissing(missingInputs);
    const completeness = buildCompletenessSection(missingInputs);

    const hexagram = castHexagramByTime(asOfDate);

    const reportId = uuidv4();
    const report: InferenceReport = {
      report_id: reportId,
      profile_id: profileId,
      scope: 'day',
      api_version: API_VERSION,
      as_of: asOfDate.toISOString(),
      summary: interpreted.summary,
      sections: [
        ...interpreted.sections.filter((s) => s.title !== completeness.title),
        {
          title: completeness.title,
          content: completeness.content,
          basis: completeness.basis,
          basis_type: 'chart_step' as const,
        },
      ],
      timeline: [],
      recommendations: interpreted.recommendations,
      practice_hint: interpreted.practice_hint,
      cautions: interpreted.cautions,
      confidence,
      missing_inputs: missingInputs,
      attached_artifacts: {
        bazi_chart: {
          natal: baziChartToRecord(natalChart),
          day: baziChartToRecord(dayChart),
          true_solar: { applied: natalChart.true_solar_applied, longitude },
        },
        hexagram: hexagramToRecord(hexagram),
      },
      practice_plan_id: null,
    };

    await this.saveReport(report, asOfDate);

    const plan = await this.practiceService.recommend({
      profile_id: profileId,
      report_id: reportId,
      scope: 'day',
    });

    report.practice_plan_id = plan.practice_plan_id;
    await this.database.db
      .update(inferenceReports)
      .set({ practicePlanId: plan.practice_plan_id })
      .where(eq(inferenceReports.id, reportId));

    return this.toInferResponse(report);
  }

  private async weekScopeInfer(
    profileId: string,
    asOf?: string,
    question?: string,
  ): Promise<DestinyInferResponse> {
    const profile = await this.profileService.findOne(profileId);
    const profileRow = await this.profileService.findRow(profileId);
    const asOfDate = asOf ? new Date(asOf) : new Date();
    const longitude = resolveLongitude(profile.birth_place, profileRow.longitude);

    const natalChart = computeBaziChart({
      datetime: profile.birth_datetime,
      longitude,
      hour_known: profile.birth_hour_known,
    });

    const timeline: InferenceReport['timeline'] = [];
    const tones: Array<'favorable' | 'neutral' | 'cautious'> = [];
    const weekDays: { date: string; pillar: string; tone: string; note: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(asOfDate.getTime() + i * 86400000);
      const dayChart = computeBaziChart({ datetime: d.toISOString(), hour_known: true });
      const rules = this.ruleEngine.analyze(dayChart, natalChart);
      const tone = rules.clashes.length > 0 ? 'cautious' : 'favorable';
      tones.push(tone);
      const dateStr = d.toISOString().slice(0, 10);
      const pillar = pillarToString(dayChart.day);
      weekDays.push({ date: dateStr, pillar, tone, note: rules.wuxing_summary });
      timeline.push({
        date: dateStr,
        label: `第${i + 1}日 · ${pillar}`,
        tone,
        note: rules.wuxing_summary,
      });
    }

    const natalRules = this.ruleEngine.analyze(natalChart);
    const interpreted = await this.interpreter.interpret({
      chart: natalChart,
      natalChart,
      rules: natalRules,
      scope: 'week',
      question,
      profileName: displayProfileName(profile.name),
      weekDays,
    });

    const missingInputs = buildMissingInputs(profile, question);
    const completeness = buildCompletenessSection(missingInputs);
    const summary = interpreted.summary;

    const reportId = uuidv4();
    const report: InferenceReport = {
      report_id: reportId,
      profile_id: profileId,
      scope: 'week',
      api_version: API_VERSION,
      as_of: asOfDate.toISOString(),
      summary,
      sections: [
        ...interpreted.sections.filter((s) => s.title !== completeness.title),
        {
          title: completeness.title,
          content: completeness.content,
          basis: completeness.basis,
          basis_type: 'chart_step' as const,
        },
      ],
      timeline,
      recommendations: interpreted.recommendations,
      practice_hint: interpreted.practice_hint,
      cautions: interpreted.cautions,
      confidence: confidenceFromMissing(missingInputs),
      missing_inputs: missingInputs,
      attached_artifacts: {
        bazi_chart: { natal: baziChartToRecord(natalChart) },
      },
      practice_plan_id: null,
    };

    await this.saveReport(report, asOfDate);

    const plan = await this.practiceService.recommend({
      profile_id: profileId,
      report_id: reportId,
      scope: 'week',
    });
    report.practice_plan_id = plan.practice_plan_id;
    await this.database.db
      .update(inferenceReports)
      .set({ practicePlanId: plan.practice_plan_id })
      .where(eq(inferenceReports.id, reportId));

    return this.toInferResponse(report);
  }

  private async yearScopeInfer(
    profileId: string,
    asOf?: string,
    question?: string,
  ): Promise<DestinyInferResponse> {
    const ctx = await this.buildScopeContext(profileId, asOf, question);
    const yearPillar = getYearPillar(ctx.asOfDate);
    const dailyClassic = await this.knowledge.pickDailyClassic(yearPillar.branch_index, {
      tradition: 'bagua',
    });
    const report = await buildYearReport(
      { ...ctx, dailyClassic },
      this.ruleEngine,
      this.interpreter,
    );
    const enriched = this.enrichWithCompleteness(report, await this.profileService.findOne(profileId), question);
    await this.saveReport(enriched, ctx.asOfDate);
    await this.attachPracticePlan(enriched, 'year');
    return this.toInferResponse(enriched);
  }

  private async lifetimeScopeInfer(
    profileId: string,
    asOf?: string,
    question?: string,
  ): Promise<DestinyInferResponse> {
    const ctx = await this.buildScopeContext(profileId, asOf, question);
    const report = await buildLifetimeReport(ctx, this.ruleEngine, this.interpreter);
    const enriched = this.enrichWithCompleteness(report, await this.profileService.findOne(profileId), question);
    await this.saveReport(enriched, ctx.asOfDate);
    await this.attachPracticePlan(enriched, 'lifetime');
    return this.toInferResponse(enriched);
  }

  private enrichWithCompleteness(
    report: InferenceReport,
    profile: Profile,
    question?: string,
  ): InferenceReport {
    const missing = buildMissingInputs(profile, question);
    const completeness = buildCompletenessSection(missing);
    return {
      ...report,
      confidence: confidenceFromMissing(missing),
      missing_inputs: missing,
      sections: [
        ...report.sections.filter((s) => s.title !== completeness.title),
        {
          title: completeness.title,
          content: completeness.content,
          basis: completeness.basis,
          basis_type: 'chart_step',
        },
      ],
    };
  }

  private async buildScopeContext(profileId: string, asOf?: string, question?: string) {
    const profile = await this.profileService.findOne(profileId);
    const row = await this.profileService.findRow(profileId);
    const asOfDate = asOf ? new Date(asOf) : new Date();
    return {
      profileId,
      profileName: displayProfileName(profile.name),
      gender: profile.gender,
      birthDatetime: profile.birth_datetime,
      birthPlace: profile.birth_place,
      longitude: resolveLongitude(profile.birth_place, row.longitude),
      hourKnown: profile.birth_hour_known,
      asOfDate,
      question,
    };
  }

  private async attachPracticePlan(report: InferenceReport, scope: 'day' | 'week' | 'year' | 'lifetime') {
    const plan = await this.practiceService.recommend({
      profile_id: report.profile_id,
      report_id: report.report_id,
      scope,
    });
    report.practice_plan_id = plan.practice_plan_id;
    await this.database.db
      .update(inferenceReports)
      .set({ practicePlanId: plan.practice_plan_id })
      .where(eq(inferenceReports.id, report.report_id));
  }

  async compareReports(ids: string[]) {
    if (ids.length < 2 || ids.length > 4) {
      throw new BadRequestException('请提供 2–4 个报告 ID');
    }
    const reports = await Promise.all(ids.map((id) => this.getReport(id)));
    return {
      reports: reports.map((r) => ({
        report_id: r.report_id,
        scope: r.scope,
        as_of: r.as_of,
        summary: r.summary,
        confidence: r.confidence,
      })),
    };
  }

  private async saveReport(report: InferenceReport, asOfDate: Date) {
    await this.database.db.insert(inferenceReports).values({
      id: report.report_id,
      profileId: report.profile_id,
      scope: report.scope,
      apiVersion: report.api_version,
      asOf: asOfDate,
      summary: report.summary,
      sections: report.sections,
      timeline: report.timeline,
      recommendations: report.recommendations,
      practiceHint: report.practice_hint,
      cautions: report.cautions,
      confidence: report.confidence,
      missingInputs: report.missing_inputs,
      attachedArtifacts: report.attached_artifacts,
      practicePlanId: report.practice_plan_id,
    });
  }

  private toInferResponse(report: InferenceReport): DestinyInferResponse {
    const webHost = this.config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000';
    return {
      report_id: report.report_id,
      summary: report.summary,
      deep_link: `${webHost}/reports/${report.report_id}`,
      status: 'completed',
    };
  }

  async getReport(id: string): Promise<InferenceReport> {
    const [row] = await this.database.db
      .select()
      .from(inferenceReports)
      .where(eq(inferenceReports.id, id));

    if (!row) {
      throw new NotFoundException({ code: 'REPORT_NOT_FOUND', message: '报告不存在' });
    }

    return {
      report_id: row.id,
      profile_id: row.profileId,
      scope: row.scope,
      api_version: row.apiVersion,
      as_of: row.asOf.toISOString(),
      summary: row.summary,
      sections: row.sections as InferenceReport['sections'],
      timeline: (row.timeline as InferenceReport['timeline']) ?? [],
      recommendations: (row.recommendations as string[]) ?? [],
      practice_hint: (row.practiceHint as string[]) ?? [],
      cautions: (row.cautions as string[]) ?? [],
      confidence: row.confidence,
      missing_inputs: (row.missingInputs as string[]) ?? [],
      attached_artifacts: (row.attachedArtifacts as InferenceReport['attached_artifacts']) ?? {},
      practice_plan_id: row.practicePlanId,
    };
  }

  async reportQa(request: ReportQaRequest): Promise<ReportQaResponse> {
    const report = await this.getReport(request.report_id);
    const section = report.sections.find((s) =>
      s.title.includes('气机') || s.title.includes('总览'),
    );
    return {
      answer: `基于报告上下文：${section?.content ?? report.summary}。关于「${request.question}」——宜结合日主格局与当日气机综合理解，避免单点吉凶论。`,
      basis: report.sections.flatMap((s) => s.basis).slice(0, 5),
      status: 'completed',
    };
  }

  /** 每日运势摘要（推送/Agent 专用，不扣积分） */
  async buildDailyFortune(profileId: string, asOf?: string) {
    const profile = await this.profileService.findOne(profileId);
    const profileRow = await this.profileService.findRow(profileId);
    const asOfDate = asOf ? new Date(asOf) : new Date();
    const dateStr = asOfDate.toISOString().slice(0, 10);
    const longitude = resolveLongitude(profile.birth_place, profileRow.longitude);

    const natalChart = computeBaziChart({
      datetime: profile.birth_datetime,
      longitude,
      birth_place: profile.birth_place,
      hour_known: profile.birth_hour_known,
    });
    const dayChart = computeBaziChart({ datetime: asOfDate.toISOString(), hour_known: true });
    const rules = this.ruleEngine.analyze(dayChart, natalChart);
    const interpreted = await this.interpreter.interpret({
      chart: dayChart,
      natalChart,
      rules,
      scope: 'day',
      profileName: displayProfileName(profile.name),
    });

    const hexagram = castHexagramByTime(asOfDate);
    const almanac = computeAlmanac(asOfDate);
    const dmElement = rules.wuxing_summary.match(/属(.)/)?.[1];
    const classic = await this.knowledge.pickDailyClassic(dayChart.day.branch_index, {
      element: dmElement,
    });

    const reportId = uuidv4();
    const report: InferenceReport = {
      report_id: reportId,
      profile_id: profileId,
      scope: 'day',
      api_version: API_VERSION,
      as_of: asOfDate.toISOString(),
      summary: interpreted.summary,
      sections: interpreted.sections,
      timeline: [],
      recommendations: interpreted.recommendations,
      practice_hint: interpreted.practice_hint,
      cautions: interpreted.cautions,
      confidence: 0.85,
      missing_inputs: [],
      attached_artifacts: {
        bazi_chart: { natal: baziChartToRecord(natalChart), day: baziChartToRecord(dayChart) },
        hexagram: hexagramToRecord(hexagram),
      },
      practice_plan_id: null,
    };
    await this.saveReport(report, asOfDate);

    const modern = await this.knowledge.resolveModernContextForInference({
      seed: dayChart.day.branch_index,
      hasClash: (rules.clashes?.length ?? 0) > 0,
    });

    const webHost = this.config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000';
    return {
      date: dateStr,
      profile_id: profileId,
      profile_name: profile.name,
      report_id: reportId,
      summary: interpreted.summary,
      day_pillar: pillarToString(dayChart.day),
      recommendations: interpreted.recommendations.slice(0, 3),
      practice_hint: interpreted.practice_hint.slice(0, 2),
      branch_relations: rules.branch_relations,
      classic: { title: classic.title, content: classic.content, basis: classic.basis },
      science: { title: modern.science.title, content: modern.science.content },
      world_pulse: modern.world_lines,
      almanac: {
        day_pillar: almanac.day_pillar,
        lunar_label: almanac.lunar_label,
        yi: almanac.yi.slice(0, 4),
        ji: almanac.ji.slice(0, 4),
        solar_term: almanac.solar_term,
      },
      hexagram: { primary: hexagram.primary_hexagram, changed: hexagram.changed_hexagram },
      deep_link: webHost + '/reports/' + reportId,
    };
  }

  async hexagramCast(request: HexagramCastRequest, apiKey?: string): Promise<HexagramResult> {
    const parsed = HexagramCastRequestSchema.safeParse(request);
    if (!parsed.success) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    }

    await this.billing.deduct(apiKey, this.billing.getHexagramCost());

    const { method, numbers, as_of, question, question_type, profile_id } = parsed.data;
    const asOfDate = as_of ? new Date(as_of) : new Date();

    let chart;
    if (method === 'number' && numbers) {
      const { castHexagramByNumbers } = await import('@cyberdestiny/chart-engine');
      chart = castHexagramByNumbers(numbers as [number, number, number]);
    } else {
      chart = castHexagramByTime(asOfDate);
    }

    const id = uuidv4();
    const result: HexagramResult = {
      hexagram_id: id,
      method,
      primary_hexagram: chart.primary_hexagram,
      changed_hexagram: chart.changed_hexagram,
      lines: chart.lines,
      question,
      question_type,
      skeleton: chart.skeleton,
    };

    await this.database.db.insert(hexagramCasts).values({
      id,
      profileId: profile_id,
      method,
      result: chart as unknown as Record<string, unknown>,
    });

    return result;
  }
}
