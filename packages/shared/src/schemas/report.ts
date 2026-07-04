import { z } from 'zod';
import { BASIS_TYPES, INFERENCE_SCOPES } from '../constants';

export const BasisTypeSchema = z.enum(BASIS_TYPES);

export const ReportSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  basis: z.array(z.string()),
  basis_type: BasisTypeSchema,
});

export const InferenceScopeSchema = z.enum(INFERENCE_SCOPES);

export const AttachedArtifactsSchema = z.object({
  bazi_chart: z.record(z.unknown()).optional(),
  hexagram: z.record(z.unknown()).optional(),
  fengshui: z.record(z.unknown()).optional(),
});

export const InferenceReportSchema = z.object({
  report_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  scope: InferenceScopeSchema,
  api_version: z.string(),
  as_of: z.string().datetime({ offset: true }),
  summary: z.string(),
  sections: z.array(ReportSectionSchema),
  timeline: z.array(z.record(z.unknown())).default([]),
  recommendations: z.array(z.string()).default([]),
  practice_hint: z.array(z.string()).default([]),
  cautions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  missing_inputs: z.array(z.string()).default([]),
  attached_artifacts: AttachedArtifactsSchema.default({}),
  practice_plan_id: z.string().uuid().nullable().optional(),
});

export type ReportSection = z.infer<typeof ReportSectionSchema>;
export type InferenceReport = z.infer<typeof InferenceReportSchema>;
export type InferenceScope = z.infer<typeof InferenceScopeSchema>;
