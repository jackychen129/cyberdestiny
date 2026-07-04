import { z } from 'zod';

export const GenderSchema = z.enum(['male', 'female', 'unknown']);

export const ProfileCreateSchema = z.object({
  name: z.string().optional(),
  gender: GenderSchema.optional().default('unknown'),
  birth_datetime: z.string().datetime({ offset: true }),
  birth_place: z.string().optional(),
  current_location: z.string().optional(),
  occupation: z.string().optional(),
  focus_topics: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  /** Quick input: YYYYMMDDHHmm */
  quick_input: z.string().regex(/^\d{12}$/).optional(),
  /** 是否确知出生时辰；false 则降精度 */
  birth_hour_known: z.boolean().optional(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
});

export const ProfileUpdateSchema = ProfileCreateSchema.partial();

export const ProfileSchema = ProfileCreateSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  birth_hour_known: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Gender = z.infer<typeof GenderSchema>;
export type ProfileCreate = z.infer<typeof ProfileCreateSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type Profile = z.infer<typeof ProfileSchema>;

/** Parse YYYYMMDDHHmm quick input to ISO datetime (Asia/Shanghai) */
export function parseQuickInput(quick: string): string {
  const y = quick.slice(0, 4);
  const m = quick.slice(4, 6);
  const d = quick.slice(6, 8);
  const h = quick.slice(8, 10);
  const min = quick.slice(10, 12);
  return `${y}-${m}-${d}T${h}:${min}:00+08:00`;
}
