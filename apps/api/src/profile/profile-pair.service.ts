import { Injectable, BadRequestException } from '@nestjs/common';
import {
  computeBaziChart,
  baziChartToRecord,
  analyzePair,
  resolveLongitude,
} from '@cyberdestiny/chart-engine';
import { ProfilePairRequestSchema, type ProfilePairRequest, type ProfilePairResponse } from '@cyberdestiny/shared';
import { ProfileService } from './profile.service';

@Injectable()
export class ProfilePairService {
  constructor(private readonly profiles: ProfileService) {}

  async pair(request: ProfilePairRequest): Promise<ProfilePairResponse> {
    const parsed = ProfilePairRequestSchema.safeParse(request);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const { profile_id_a, profile_id_b, context } = parsed.data;
    if (profile_id_a === profile_id_b) {
      throw new BadRequestException('不能与自己合盘');
    }

    const [profileA, profileB, rowA, rowB] = await Promise.all([
      this.profiles.findOne(profile_id_a),
      this.profiles.findOne(profile_id_b),
      this.profiles.findRow(profile_id_a),
      this.profiles.findRow(profile_id_b),
    ]);

    const chartA = computeBaziChart({
      datetime: profileA.birth_datetime,
      longitude: resolveLongitude(profileA.birth_place, rowA.longitude),
      hour_known: profileA.birth_hour_known,
    });
    const chartB = computeBaziChart({
      datetime: profileB.birth_datetime,
      longitude: resolveLongitude(profileB.birth_place, rowB.longitude),
      hour_known: profileB.birth_hour_known,
    });

    const analysis = analyzePair(chartA, chartB);

    return {
      profile_id_a,
      profile_id_b,
      context,
      compatibility_score: analysis.compatibility_score,
      day_master_relation: analysis.day_master_relation,
      branch_relations: analysis.branch_relations,
      strengths: analysis.strengths,
      cautions: analysis.cautions,
      basis: analysis.basis,
      charts: {
        a: baziChartToRecord(chartA),
        b: baziChartToRecord(chartB),
      },
    };
  }
}
