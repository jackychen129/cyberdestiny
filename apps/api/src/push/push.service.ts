import { Injectable, BadRequestException } from '@nestjs/common';
import { and, eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { dailySubscriptions, dailyPushLogs } from '../database/schema';
import { ProfileService } from '../profile/profile.service';
import { InferenceService } from '../inference/inference.service';

@Injectable()
export class PushService {
  constructor(
    private readonly database: DatabaseService,
    private readonly profiles: ProfileService,
    private readonly inference: InferenceService,
  ) {}

  async subscribe(profileId: string, userId?: string, pushHour = 8) {
    await this.profiles.findOne(profileId);
    const existing = await this.database.db
      .select()
      .from(dailySubscriptions)
      .where(eq(dailySubscriptions.profileId, profileId))
      .limit(1);
    if (existing[0]) {
      await this.database.db
        .update(dailySubscriptions)
        .set({ enabled: true, userId: userId ?? existing[0].userId, pushHour })
        .where(eq(dailySubscriptions.id, existing[0].id));
      return { subscription_id: existing[0].id, profile_id: profileId, enabled: true };
    }
    const id = uuidv4();
    await this.database.db.insert(dailySubscriptions).values({
      id,
      userId,
      profileId,
      enabled: true,
      pushHour,
    });
    return { subscription_id: id, profile_id: profileId, enabled: true };
  }

  async unsubscribe(profileId: string) {
    await this.database.db
      .update(dailySubscriptions)
      .set({ enabled: false })
      .where(eq(dailySubscriptions.profileId, profileId));
    return { ok: true, profile_id: profileId, enabled: false };
  }

  async listSubscriptions(userId?: string) {
    const rows = userId
      ? await this.database.db
          .select()
          .from(dailySubscriptions)
          .where(eq(dailySubscriptions.userId, userId))
      : await this.database.db.select().from(dailySubscriptions);
    return {
      items: rows.map((r) => ({
        subscription_id: r.id,
        profile_id: r.profileId,
        enabled: r.enabled,
        push_hour: r.pushHour,
        timezone: r.timezone,
      })),
    };
  }

  async getDailyFortune(profileId: string, date?: string) {
    await this.profiles.findOne(profileId);
    const pushDate = date ?? new Date().toISOString().slice(0, 10);

    const [cached] = await this.database.db
      .select()
      .from(dailyPushLogs)
      .where(and(eq(dailyPushLogs.profileId, profileId), eq(dailyPushLogs.pushDate, pushDate)))
      .limit(1);
    if (cached) {
      return { source: 'cache', ...(cached.payload as Record<string, unknown>) };
    }

    const fortune = await this.inference.buildDailyFortune(profileId, date ? date + 'T08:00:00+08:00' : undefined);
    const [sub] = await this.database.db
      .select()
      .from(dailySubscriptions)
      .where(eq(dailySubscriptions.profileId, profileId))
      .limit(1);

    await this.database.db.insert(dailyPushLogs).values({
      id: uuidv4(),
      subscriptionId: sub?.id,
      profileId,
      pushDate,
      reportId: fortune.report_id,
      payload: fortune as unknown as Record<string, unknown>,
    });

    return { source: 'fresh', ...fortune };
  }

  async getInbox(profileId: string, limit = 7) {
    await this.profiles.findOne(profileId);
    const rows = await this.database.db
      .select()
      .from(dailyPushLogs)
      .where(eq(dailyPushLogs.profileId, profileId))
      .orderBy(desc(dailyPushLogs.pushDate))
      .limit(limit);
    return {
      items: rows.map((r) => ({
        push_date: r.pushDate,
        report_id: r.reportId,
        summary: (r.payload as { summary?: string }).summary,
        payload: r.payload,
      })),
    };
  }

  /** Cron / 管理触发：为所有已订阅档案生成今日运势 */
  async runDailyPushAll() {
    const subs = await this.database.db
      .select()
      .from(dailySubscriptions)
      .where(eq(dailySubscriptions.enabled, true));
    const results: { profile_id: string; ok: boolean; error?: string }[] = [];
    for (const sub of subs) {
      try {
        await this.getDailyFortune(sub.profileId);
        results.push({ profile_id: sub.profileId, ok: true });
      } catch (e) {
        results.push({
          profile_id: sub.profileId,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
    return { date: new Date().toISOString().slice(0, 10), total: subs.length, results };
  }
}
