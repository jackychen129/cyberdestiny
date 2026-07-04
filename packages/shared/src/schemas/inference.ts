import { z } from 'zod';
import { InferenceScopeSchema } from './report';

export const DestinyInferRequestSchema = z.object({
  profile_id: z.string().uuid(),
  scope: InferenceScopeSchema,
  question: z.string().optional(),
  question_type: z
    .enum(['career', 'relationship', 'health', 'travel', 'practice', 'custom'])
    .optional(),
  as_of: z.string().datetime({ offset: true }).optional(),
});

export const DestinyInferResponseSchema = z.object({
  report_id: z.string().uuid(),
  summary: z.string(),
  deep_link: z.string().url(),
  status: z.enum(['completed', 'processing', 'failed']),
  credits_remaining: z.number().optional(),
});

export const ReportQaRequestSchema = z.object({
  report_id: z.string().uuid(),
  question: z.string().min(1),
});

export const ReportQaResponseSchema = z.object({
  answer: z.string(),
  basis: z.array(z.string()).default([]),
  status: z.enum(['completed', 'not_implemented']),
});

export type DestinyInferRequest = z.infer<typeof DestinyInferRequestSchema>;
export type DestinyInferResponse = z.infer<typeof DestinyInferResponseSchema>;
export type ReportQaRequest = z.infer<typeof ReportQaRequestSchema>;
export type ReportQaResponse = z.infer<typeof ReportQaResponseSchema>;
