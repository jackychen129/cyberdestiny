import { z } from 'zod';

export const PracticeItemSchema = z.object({
  type: z.enum(['meditation', 'breath', 'classic_reading', 'action']),
  title: z.string(),
  reason_basis: z.array(z.string()),
  duration_minutes: z.number().int().positive(),
  optional: z.boolean().default(false),
});

export const PracticePlanSchema = z.object({
  practice_plan_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  derived_from_report_id: z.string().uuid().optional(),
  period: z.enum(['daily', 'weekly', 'solar_term', '21day']),
  items: z.array(PracticeItemSchema),
  check_ins: z.array(z.record(z.unknown())).default([]),
});

export const PracticeRecommendRequestSchema = z.object({
  profile_id: z.string().uuid(),
  scope: z.enum(['day', 'week', 'year', 'lifetime']).optional(),
  report_id: z.string().uuid().optional(),
});

export type PracticePlan = z.infer<typeof PracticePlanSchema>;
export type PracticeRecommendRequest = z.infer<typeof PracticeRecommendRequestSchema>;
