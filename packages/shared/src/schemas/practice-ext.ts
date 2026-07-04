import { z } from 'zod';

export const PracticeCheckInSchema = z.object({
  practice_plan_id: z.string().uuid(),
  item_index: z.number().int().min(0).optional(),
  duration_minutes: z.number().int().positive().optional(),
  note: z.string().optional(),
});

export const PracticeStart21DaySchema = z.object({
  profile_id: z.string().uuid(),
  report_id: z.string().uuid().optional(),
});

export type PracticeCheckIn = z.infer<typeof PracticeCheckInSchema>;
export type PracticeStart21Day = z.infer<typeof PracticeStart21DaySchema>;
