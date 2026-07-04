import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { caseSnapshots } from '../database/schema';
import { ProfileService } from '../profile/profile.service';
import { InferenceService } from '../inference/inference.service';

@Injectable()
export class CasesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly profiles: ProfileService,
    private readonly inference: InferenceService,
  ) {}

  async createSnapshot(profileId: string, reportId: string, label?: string) {
    await this.profiles.findOne(profileId);
    const report = await this.inference.getReport(reportId);

    const id = uuidv4();
    await this.database.db.insert(caseSnapshots).values({
      id,
      profileId,
      reportId,
      label: label ?? `${report.scope} @ ${report.as_of.slice(0, 10)}`,
      snapshot: report as unknown as Record<string, unknown>,
    });

    return { case_id: id, label, report_id: reportId };
  }

  async listByProfile(profileId: string) {
    await this.profiles.findOne(profileId);
    const rows = await this.database.db
      .select()
      .from(caseSnapshots)
      .where(eq(caseSnapshots.profileId, profileId))
      .orderBy(desc(caseSnapshots.createdAt));

    return {
      items: rows.map((r) => ({
        case_id: r.id,
        profile_id: r.profileId,
        report_id: r.reportId,
        label: r.label,
        scope: (r.snapshot as { scope?: string }).scope,
        summary: (r.snapshot as { summary?: string }).summary?.slice(0, 80),
        created_at: r.createdAt.toISOString(),
      })),
      total: rows.length,
    };
  }

  async getSnapshot(caseId: string) {
    const [row] = await this.database.db
      .select()
      .from(caseSnapshots)
      .where(eq(caseSnapshots.id, caseId));
    if (!row) throw new NotFoundException('案例不存在');
    return { case_id: row.id, label: row.label, snapshot: row.snapshot };
  }
}
