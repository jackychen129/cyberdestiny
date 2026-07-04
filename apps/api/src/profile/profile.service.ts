import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  ProfileCreateSchema,
  ProfileUpdateSchema,
  parseQuickInput,
  type Profile,
  type ProfileCreate,
  type ProfileUpdate,
} from '@cyberdestiny/shared';
import { DatabaseService } from '../database/database.service';
import { profiles } from '../database/schema';

@Injectable()
export class ProfileService {
  constructor(private readonly database: DatabaseService) {}

  async create(input: ProfileCreate, userId?: string, guestSessionId?: string): Promise<Profile> {
    if (!userId && guestSessionId) {
      return this.upsertGuest(guestSessionId, input);
    }
    if (!userId && !guestSessionId) {
      throw new BadRequestException({
        code: 'GUEST_SESSION_REQUIRED',
        message: '匿名推演需携带 X-Guest-Session 请求头',
      });
    }

    const parsed = ProfileCreateSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const birthDatetime = this.resolveBirthDatetime(parsed.data);
    const birthHourKnown = this.resolveBirthHourKnown(parsed.data, birthDatetime);

    const [row] = await this.database.db
      .insert(profiles)
      .values({
        name: parsed.data.name,
        gender: parsed.data.gender,
        birthDatetime: new Date(birthDatetime),
        birthPlace: parsed.data.birth_place,
        currentLocation: parsed.data.current_location,
        occupation: parsed.data.occupation,
        focusTopics: parsed.data.focus_topics ?? [],
        notes: parsed.data.notes,
        birthHourKnown,
        longitude: parsed.data.longitude,
        latitude: parsed.data.latitude,
        userId: userId ?? null,
        guestSessionId: null,
      })
      .returning();

    if (!row) throw new Error('Failed to create profile');
    return this.toProfile(row);
  }

  /** 匿名会话：仅一条档案，不保存姓名 */
  async upsertGuest(guestSessionId: string, input: ProfileCreate): Promise<Profile> {
    const parsed = ProfileCreateSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const birthDatetime = this.resolveBirthDatetime(parsed.data);
    const birthHourKnown = this.resolveBirthHourKnown(parsed.data, birthDatetime);

    const [existing] = await this.database.db
      .select()
      .from(profiles)
      .where(eq(profiles.guestSessionId, guestSessionId))
      .limit(1);

    const values = {
      name: null as string | null,
      gender: parsed.data.gender,
      birthDatetime: new Date(birthDatetime),
      birthPlace: parsed.data.birth_place,
      currentLocation: parsed.data.current_location,
      occupation: parsed.data.occupation,
      focusTopics: parsed.data.focus_topics ?? [],
      notes: parsed.data.notes,
      birthHourKnown,
      longitude: parsed.data.longitude,
      latitude: parsed.data.latitude,
      userId: null as string | null,
      guestSessionId,
      updatedAt: new Date(),
    };

    if (existing) {
      const [row] = await this.database.db
        .update(profiles)
        .set(values)
        .where(eq(profiles.id, existing.id))
        .returning();
      if (!row) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND' });
      return this.toProfile(row);
    }

    const [row] = await this.database.db.insert(profiles).values(values).returning();
    if (!row) throw new Error('Failed to create guest profile');
    return this.toProfile(row);
  }

  async findAll(userId?: string, guestSessionId?: string): Promise<Profile[]> {
    if (userId) {
      const rows = await this.database.db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId));
      return rows.map((r) => this.toProfile(r));
    }
    if (guestSessionId) {
      const rows = await this.database.db
        .select()
        .from(profiles)
        .where(eq(profiles.guestSessionId, guestSessionId));
      return rows.map((r) => this.toProfile(r));
    }
    return [];
  }

  async findOne(id: string): Promise<Profile> {
    const row = await this.findRow(id);
    return this.toProfile(row);
  }

  async findRow(id: string): Promise<typeof profiles.$inferSelect> {
    const [row] = await this.database.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id));
    if (!row) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', message: '档案不存在' });
    return row;
  }

  async update(id: string, input: ProfileUpdate, opts?: { guestSessionId?: string }): Promise<Profile> {
    const row = await this.findRow(id);

    if (row.guestSessionId) {
      if (opts?.guestSessionId !== row.guestSessionId) {
        throw new ConflictException({ code: 'GUEST_PROFILE_FORBIDDEN', message: '无权修改此匿名档案' });
      }
    }

    const parsed = ProfileUpdateSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (row.guestSessionId) {
      updates.name = null;
    } else if (parsed.data.name !== undefined) {
      updates.name = parsed.data.name;
    }
    if (parsed.data.gender !== undefined) updates.gender = parsed.data.gender;
    if (parsed.data.birth_datetime !== undefined) {
      updates.birthDatetime = new Date(parsed.data.birth_datetime);
      if (parsed.data.birth_hour_known === undefined) {
        updates.birthHourKnown = !parsed.data.birth_datetime.includes('T00:00:00');
      }
    }
    if (parsed.data.birth_hour_known !== undefined) updates.birthHourKnown = parsed.data.birth_hour_known;
    if (parsed.data.birth_place !== undefined) updates.birthPlace = parsed.data.birth_place;
    if (parsed.data.current_location !== undefined) updates.currentLocation = parsed.data.current_location;
    if (parsed.data.occupation !== undefined) updates.occupation = parsed.data.occupation;
    if (parsed.data.focus_topics !== undefined) updates.focusTopics = parsed.data.focus_topics;
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
    if (parsed.data.longitude !== undefined) updates.longitude = parsed.data.longitude;
    if (parsed.data.latitude !== undefined) updates.latitude = parsed.data.latitude;

    const [updated] = await this.database.db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();

    if (!updated) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', message: '档案不存在' });
    return this.toProfile(updated);
  }

  async remove(id: string, guestSessionId?: string): Promise<void> {
    const row = await this.findRow(id);
    if (row.guestSessionId && row.guestSessionId !== guestSessionId) {
      throw new ConflictException({ code: 'GUEST_PROFILE_FORBIDDEN' });
    }
    await this.database.db.delete(profiles).where(eq(profiles.id, id));
  }

  private resolveBirthDatetime(data: ProfileCreate): string {
    if (data.quick_input) return parseQuickInput(data.quick_input);
    return data.birth_datetime;
  }

  private resolveBirthHourKnown(data: ProfileCreate, birthDatetime: string): boolean {
    if (data.birth_hour_known !== undefined) return data.birth_hour_known;
    return !birthDatetime.includes('T00:00:00');
  }

  private toProfile(row: typeof profiles.$inferSelect): Profile {
    return {
      id: row.id,
      name: row.guestSessionId ? undefined : row.name ?? undefined,
      gender: row.gender,
      birth_datetime: row.birthDatetime.toISOString(),
      birth_place: row.birthPlace ?? undefined,
      current_location: row.currentLocation ?? undefined,
      occupation: row.occupation ?? undefined,
      focus_topics: (row.focusTopics as string[]) ?? [],
      notes: row.notes ?? undefined,
      birth_hour_known: row.birthHourKnown,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    };
  }
}
