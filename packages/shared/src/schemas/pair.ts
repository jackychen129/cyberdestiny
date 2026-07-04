import { z } from 'zod';

export const ProfilePairRequestSchema = z.object({
  profile_id_a: z.string().uuid(),
  profile_id_b: z.string().uuid(),
  context: z.enum(['relationship', 'business', 'general']).optional().default('general'),
});

export const ProfilePairResponseSchema = z.object({
  profile_id_a: z.string().uuid(),
  profile_id_b: z.string().uuid(),
  context: z.string(),
  compatibility_score: z.number(),
  day_master_relation: z.string(),
  branch_relations: z.array(z.string()),
  strengths: z.array(z.string()),
  cautions: z.array(z.string()),
  basis: z.array(z.string()),
  charts: z.object({
    a: z.record(z.unknown()),
    b: z.record(z.unknown()),
  }),
});

export type ProfilePairRequest = z.infer<typeof ProfilePairRequestSchema>;
export type ProfilePairResponse = z.infer<typeof ProfilePairResponseSchema>;
