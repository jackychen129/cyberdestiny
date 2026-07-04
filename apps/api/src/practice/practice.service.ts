import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { computeBaziChart, resolveLongitude } from '@cyberdestiny/chart-engine';
import {
  PracticeRecommendRequestSchema,
  PracticeCheckInSchema,
  PracticeStart21DaySchema,
  type PracticeRecommendRequest,
  type PracticePlan,
  type PracticeCheckIn,
  type PracticeStart21Day,
} from '@cyberdestiny/shared';
import { DatabaseService } from '../database/database.service';
import { inferenceReports, practicePlans } from '../database/schema';
import { ProfileService } from '../profile/profile.service';
import { RuleEngineService } from '../inference/rule-engine.service';

@Injectable()
export class PracticeService {
  constructor(
    private readonly database: DatabaseService,
    private readonly profiles: ProfileService,
    private readonly ruleEngine: RuleEngineService,
  ) {}

  async recommend(request: PracticeRecommendRequest): Promise<PracticePlan> {
    const parsed = PracticeRecommendRequestSchema.safeParse(request);
    if (!parsed.success) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    }

    const { profile_id, report_id, scope = 'day' } = parsed.data;
    const profile = await this.profiles.findOne(profile_id);
    const profileRow = await this.profiles.findRow(profile_id);

    let reportHints: string[] = [];
    if (report_id) {
      const [row] = await this.database.db
        .select()
        .from(inferenceReports)
        .where(eq(inferenceReports.id, report_id));
      if (!row) {
        throw new NotFoundException({ code: 'REPORT_NOT_FOUND', message: '报告不存在' });
      }
      reportHints = (row.practiceHint as string[]) ?? [];
    }

    const longitude = resolveLongitude(profile.birth_place, profileRow.longitude);
    const chart = computeBaziChart({
      datetime: profile.birth_datetime,
      longitude,
      birth_place: profile.birth_place,
      hour_known: profile.birth_hour_known,
    });

    const dayChart = computeBaziChart({
      datetime: new Date().toISOString(),
      hour_known: true,
    });

    const rules = this.ruleEngine.analyze(scope === 'day' ? dayChart : chart);
    const favorable = rules.favorable_elements[0] ?? '木';

    const practiceHints =
      reportHints.length > 0
        ? reportHints
        : [`${favorable}气偏旺时宜收神静坐`, '傍晚轻行，松驰身心'];

    const planId = uuidv4();
    const plan: PracticePlan = {
      practice_plan_id: planId,
      profile_id,
      derived_from_report_id: report_id,
      period: scope === 'week' ? 'weekly' : 'daily',
      items: [
        {
          type: 'meditation',
          title: '辰时静坐 15 分钟',
          reason_basis: [
            `wuxing:${favorable}旺宜静`,
            'classic:道德经-致虚极',
            `chart_step:day_master:${rules.day_master}`,
          ],
          duration_minutes: 15,
          optional: false,
        },
        {
          type: 'classic_reading',
          title: '每日一典：诵读《道德经》第一章',
          reason_basis: ['classic:道德经-道可道', 'practice:知命认命'],
          duration_minutes: 5,
          optional: true,
        },
        {
          type: 'action',
          title: practiceHints[0] ?? '顺时轻行 20 分钟',
          reason_basis: [`wuxing:favorable:${favorable}`, 'practice:改命行动'],
          duration_minutes: 20,
          optional: false,
        },
      ],
      check_ins: [],
    };

    await this.database.db.insert(practicePlans).values({
      id: planId,
      profileId: profile_id,
      derivedFromReportId: report_id,
      period: plan.period,
      items: plan.items,
      checkIns: [],
    });

    return plan;
  }

  async getPlan(planId: string): Promise<PracticePlan> {
    const [row] = await this.database.db
      .select()
      .from(practicePlans)
      .where(eq(practicePlans.id, planId));
    if (!row) throw new NotFoundException({ code: 'PLAN_NOT_FOUND', message: '功课计划不存在' });
    return this.rowToPlan(row);
  }

  async checkIn(request: PracticeCheckIn) {
    const parsed = PracticeCheckInSchema.safeParse(request);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const [row] = await this.database.db
      .select()
      .from(practicePlans)
      .where(eq(practicePlans.id, parsed.data.practice_plan_id));
    if (!row) throw new NotFoundException({ code: 'PLAN_NOT_FOUND', message: '功课计划不存在' });

    const checkIns = (row.checkIns as Record<string, unknown>[]) ?? [];
    const entry = {
      id: uuidv4(),
      at: new Date().toISOString(),
      item_index: parsed.data.item_index ?? 0,
      duration_minutes: parsed.data.duration_minutes ?? 10,
      note: parsed.data.note,
    };
    checkIns.push(entry);

    await this.database.db
      .update(practicePlans)
      .set({ checkIns })
      .where(eq(practicePlans.id, row.id));

    return { ok: true, check_in: entry, total: checkIns.length };
  }

  async start21Day(request: PracticeStart21Day): Promise<PracticePlan> {
    const parsed = PracticeStart21DaySchema.safeParse(request);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const { profile_id, report_id } = parsed.data;
    await this.profiles.findOne(profile_id);

    const phases = [
      { phase: '知命', days: 7, theme: '阅读报告、理解格局' },
      { phase: '认命', days: 7, theme: '观象静坐、记录感受' },
      { phase: '改命', days: 7, theme: '行动功课、顺时而为' },
    ];

    const items = phases.flatMap((p, pi) =>
      Array.from({ length: p.days }, (_, di) => ({
        type: (di % 3 === 0 ? 'meditation' : di % 3 === 1 ? 'classic_reading' : 'action') as
          | 'meditation'
          | 'classic_reading'
          | 'action',
        title: `第${pi * 7 + di + 1}天 · ${p.phase}：${p.theme}`,
        reason_basis: [`practice:21day:${p.phase}`, 'classic:道德经-知命'],
        duration_minutes: 15,
        optional: false,
      })),
    );

    const planId = uuidv4();
    const plan: PracticePlan = {
      practice_plan_id: planId,
      profile_id,
      derived_from_report_id: report_id,
      period: '21day',
      items,
      check_ins: [],
    };

    await this.database.db.insert(practicePlans).values({
      id: planId,
      profileId: profile_id,
      derivedFromReportId: report_id,
      period: '21day',
      items,
      checkIns: [],
    });

    return plan;
  }

  async monthlyReport(profileId: string) {
    await this.profiles.findOne(profileId);
    const plans = await this.database.db
      .select()
      .from(practicePlans)
      .where(eq(practicePlans.profileId, profileId));

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalCheckIns = 0;
    let totalMinutes = 0;
    for (const p of plans) {
      const checkIns = (p.checkIns as { at?: string; duration_minutes?: number }[]) ?? [];
      for (const c of checkIns) {
        if (c.at && new Date(c.at) >= monthStart) {
          totalCheckIns++;
          totalMinutes += c.duration_minutes ?? 0;
        }
      }
    }

    const reports = await this.database.db
      .select()
      .from(inferenceReports)
      .where(eq(inferenceReports.profileId, profileId));

    const monthReports = reports.filter((r) => r.createdAt >= monthStart);

    return {
      profile_id: profileId,
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      practice_check_ins: totalCheckIns,
      practice_minutes: totalMinutes,
      inference_count: monthReports.length,
      active_plans: plans.length,
      summary:
        totalCheckIns >= 10
          ? '本月功课坚持良好，宜继续保持节奏。'
          : '本月功课偏少，可从每日 10 分钟静坐开始。',
    };
  }

  private rowToPlan(row: typeof practicePlans.$inferSelect): PracticePlan {
    return {
      practice_plan_id: row.id,
      profile_id: row.profileId,
      derived_from_report_id: row.derivedFromReportId ?? undefined,
      period: row.period,
      items: row.items as PracticePlan['items'],
      check_ins: (row.checkIns as PracticePlan['check_ins']) ?? [],
    };
  }

  buildStubPlan(profileId: string, reportId?: string): PracticePlan {
    return {
      practice_plan_id: uuidv4(),
      profile_id: profileId,
      derived_from_report_id: reportId,
      period: 'daily',
      items: [
        {
          type: 'meditation',
          title: '辰时静坐 15 分钟',
          reason_basis: ['wuxing:水旺宜静', 'classic:道德经-致虚极'],
          duration_minutes: 15,
          optional: false,
        },
      ],
      check_ins: [],
    };
  }
}
