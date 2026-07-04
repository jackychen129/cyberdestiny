/**
 * Eval benchmark runner — chart-engine assertions + API optional
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeBaziChart, pillarToString, resolveLongitude } from '@cyberdestiny/chart-engine';
import { parseQuickInput } from '@cyberdestiny/shared';

const __dirname = dirname(fileURLToPath(import.meta.url));
const casesDir = join(__dirname, 'cases');

interface EvalCase {
  id: string;
  description: string;
  input: {
    profile: {
      birth_datetime?: string;
      birth_place?: string;
      birth_hour_known?: boolean;
      quick_input?: string;
    };
    scope: string;
  };
  chart_assertions?: {
    has_four_pillars?: boolean;
    true_solar_when_longitude?: boolean;
  };
  expected_themes?: string[];
}

async function main() {
  const files = (await readdir(casesDir)).filter((f) => f.endsWith('.json'));
  let passed = 0;
  let failed = 0;

  console.log(`CyberDestiny Eval: ${files.length} cases\n`);

  for (const file of files) {
    const raw = await readFile(join(casesDir, file), 'utf-8');
    const cas = JSON.parse(raw) as EvalCase;

    try {
      const profile = cas.input.profile;
      const birthDatetime =
        profile.birth_datetime ??
        (profile.quick_input ? parseQuickInput(profile.quick_input) : undefined);
      if (!birthDatetime) throw new Error('missing birth_datetime or quick_input');

      const lon = resolveLongitude(profile.birth_place);
      const chart = computeBaziChart({
        datetime: birthDatetime,
        longitude: lon,
        hour_known: profile.birth_hour_known ?? true,
      });

      if (cas.chart_assertions?.has_four_pillars) {
        if (!chart.year.stem || !chart.day.stem) throw new Error('missing pillars');
      }
      if (cas.chart_assertions?.true_solar_when_longitude && lon) {
        if (!chart.true_solar_applied) throw new Error('true solar not applied');
      }

      const dayPillar = pillarToString(chart.day);
      if (!dayPillar || dayPillar.length < 2) throw new Error('invalid day pillar');

      console.log(`  ✓ ${cas.id}: ${cas.description} [${dayPillar}]`);
      passed++;
    } catch (e) {
      console.log(`  ✗ ${cas.id}: ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
