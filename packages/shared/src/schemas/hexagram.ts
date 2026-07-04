import { z } from 'zod';

export const HexagramCastMethodSchema = z.enum(['time', 'number', 'manual']);

export const HexagramCastRequestSchema = z.object({
  profile_id: z.string().uuid().optional(),
  method: HexagramCastMethodSchema.default('time'),
  question: z.string().optional(),
  question_type: z
    .enum(['career', 'relationship', 'health', 'travel', 'practice', 'custom'])
    .optional(),
  numbers: z.array(z.number().int().min(1).max(8)).length(3).optional(),
  as_of: z.string().datetime({ offset: true }).optional(),
});

export const HexagramLineSchema = z.object({
  position: z.number().int().min(1).max(6),
  yin_yang: z.enum(['yin', 'yang']),
  moving: z.boolean(),
});

export const HexagramResultSchema = z.object({
  hexagram_id: z.string().uuid(),
  method: HexagramCastMethodSchema,
  primary_hexagram: z.string(),
  changed_hexagram: z.string().optional(),
  lines: z.array(HexagramLineSchema),
  question: z.string().optional(),
  question_type: z.string().optional(),
  /** Phase 1+: full 世应六亲六神 */
  skeleton: z.boolean().default(true),
});

export type HexagramCastRequest = z.infer<typeof HexagramCastRequestSchema>;
export type HexagramResult = z.infer<typeof HexagramResultSchema>;
