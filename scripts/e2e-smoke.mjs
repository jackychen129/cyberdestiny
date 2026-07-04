#!/usr/bin/env node
/**
 * CyberDestiny E2E smoke test — requires API on localhost:3001
 */
const API = process.env.API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.DEV_API_KEY ?? 'cd_dev_local_key';

async function req(method, path, body, opts = {}) {
  const headers = { ...(opts.headers ?? {}) };
  if (!headers['X-Guest-Session'] && !headers['X-API-Key']) {
    headers['X-Guest-Session'] = process.env.E2E_GUEST_SESSION ?? 'e2e-guest-main';
  }
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log('🧪 CyberDestiny E2E (Phase 0–3)\n');

  await req('GET', '/health');
  console.log('✓ health');

  const balance = await req('GET', '/billing/balance', null, {
    headers: { 'X-API-Key': API_KEY },
  });
  console.log('✓ billing balance', balance.credits_balance);

  const profile = await req('POST', '/profiles', {
    name: '测试命主',
    gender: 'male',
    birth_datetime: '1990-05-05T12:00:00+08:00',
    birth_place: '成都',
  });
  console.log('✓ profile', profile.id);

  const profileB = await req('POST', '/profiles', {
    name: '测试乙方',
    gender: 'female',
    birth_datetime: '1992-08-15T08:00:00+08:00',
    birth_place: '北京',
  }, { headers: { 'X-Guest-Session': 'e2e-guest-b' } });
  console.log('✓ profile B', profileB.id);

  const dayInfer = await req(
    'POST',
    '/destiny_infer',
    {
      profile_id: profile.id,
      scope: 'day',
      question: '今日运势',
    },
    { headers: { 'X-API-Key': API_KEY } },
  );
  console.log('✓ day infer', dayInfer.report_id, 'credits', dayInfer.credits_remaining);

  const yearInfer = await req('POST', '/destiny_infer', {
    profile_id: profile.id,
    scope: 'year',
  });
  console.log('✓ year infer', yearInfer.report_id);

  const lifetimeInfer = await req('POST', '/destiny_infer', {
    profile_id: profile.id,
    scope: 'lifetime',
  });
  console.log('✓ lifetime infer', lifetimeInfer.report_id);

  const yearReport = await req('GET', `/reports/${yearInfer.report_id}`);
  console.log('✓ year sections', yearReport.sections?.length, 'timeline', yearReport.timeline?.length);

  const pair = await req('POST', '/profiles/pair', {
    profile_id_a: profile.id,
    profile_id_b: profileB.id,
    context: 'relationship',
  });
  console.log('✓ pair score', pair.compatibility_score);

  const almanac = await req('GET', '/almanac/daily');
  console.log('✓ almanac', almanac.day_pillar);

  const classic = await req('GET', '/knowledge/classic_search?q=道德');
  console.log('✓ knowledge', classic.items?.length, 'items');

  const stats = await req('GET', '/knowledge/stats');
  console.log('✓ knowledge stats', stats.total, 'entries, v' + stats.seed_version);

  const tianli = await req('GET', '/knowledge/classic_search?q=天理&tradition=tianli');
  console.log('✓ tianli principles', tianli.items?.length, 'items');

  const quantum = await req('GET', '/knowledge/science_search?q=量子');
  console.log('✓ science quantum', quantum.items?.length, 'items');

  const pulse = await req('GET', '/knowledge/world-pulse?limit=3');
  console.log('✓ world pulse', pulse.headlines?.length, 'headlines');

  const yiJing = await req('GET', '/knowledge/classic_search?q=乾');
  console.log('✓ classics extended', yiJing.items?.length, 'items');

  const fiction = await req('GET', '/knowledge/classic_search?q=一人之下&fiction=1');
  console.log('✓ fiction pack', fiction.items?.length, 'items');

  const md = await fetch(`${API}/reports/${dayInfer.report_id}/export/markdown`);
  if (!md.ok) throw new Error('markdown export failed');
  console.log('✓ markdown export', (await md.text()).slice(0, 30) + '…');

  const compare = await req('GET', `/reports/compare?ids=${dayInfer.report_id},${yearInfer.report_id}`);
  console.log('✓ compare', compare.reports?.length, 'reports');

  const plan21 = await req('POST', '/practice/start-21day', {
    profile_id: profile.id,
    report_id: dayInfer.report_id,
  });
  console.log('✓ 21day plan', plan21.practice_plan_id, plan21.items?.length, 'items');

  const checkIn = await req('POST', '/practice/check-in', {
    practice_plan_id: plan21.practice_plan_id,
    item_index: 0,
    duration_minutes: 15,
    note: 'E2E 打卡',
  });
  console.log('✓ check-in', checkIn.total);

  const monthly = await req('GET', `/practice/monthly-report/${profile.id}`);
  console.log('✓ monthly report', monthly.practice_check_ins, 'check-ins');

  const caseSnap = await req('POST', '/cases/snapshot', {
    profile_id: profile.id,
    report_id: dayInfer.report_id,
    label: 'E2E 案例',
  });
  console.log('✓ case snapshot', caseSnap.case_id);

  const cases = await req('GET', `/cases?profile_id=${profile.id}`);
  console.log('✓ cases list', cases.total);

  const daily = await req('GET', `/push/daily?profile_id=${profile.id}`);
  console.log('✓ daily fortune', daily.summary?.slice(0, 20) + '…');

  const sub = await req('POST', '/push/subscribe', { profile_id: profile.id, push_hour: 8 });
  console.log('✓ push subscribe', sub.enabled);

  const inbox = await req('GET', `/push/inbox?profile_id=${profile.id}&limit=3`);
  console.log('✓ push inbox', inbox.items?.length, 'items');

  const shensha = await req('GET', `/metaphysics/shensha?profile_id=${profile.id}`);
  console.log('✓ shensha', shensha.shensha?.length, 'items');

  const enhanced = await req('GET', '/metaphysics/almanac/enhanced');
  console.log('✓ enhanced almanac', enhanced.jianchu);

  const zeri = await req('POST', '/metaphysics/zeri', {
    start_date: '2026-06-01',
    end_date: '2026-06-07',
    activity: 'travel',
  });
  console.log('✓ zeri', zeri.length, 'days');

  const meihua = await req('POST', '/metaphysics/meihua', { method: 'number', numbers: [3, 5, 8] });
  console.log('✓ meihua', meihua.hexagram);

  const qimen = await req('GET', '/metaphysics/qimen');
  console.log('✓ qimen ju', qimen.ju);

  const liuren = await req('GET', '/metaphysics/liuren');
  console.log('✓ liuren', liuren.san_chuan?.chu);

  const xlr = await req('POST', '/metaphysics/xiaoliuren', { question: 'E2E' });
  console.log('✓ xiaoliuren', xlr.result_palace);

  const ziwei = await req('GET', `/metaphysics/ziwei?profile_id=${profile.id}`);
  console.log('✓ ziwei', ziwei.ming_palace);

  const cross = await req('GET', `/metaphysics/bazi-ziwei-cross?profile_id=${profile.id}`);
  console.log('✓ bazi-ziwei cross', cross.alignment_score);

  const lifetimeSections = lifetimeInfer.report_id
    ? (await req('GET', `/reports/${lifetimeInfer.report_id}`)).sections?.map((s) => s.title)
    : [];
  if (lifetimeSections?.includes('八字紫微交叉印证')) {
    console.log('✓ lifetime cross section');
  }

  console.log('\n✅ Phase 5 E2E passed');
}

main().catch((e) => {
  console.error('\n❌', e.message);
  process.exit(1);
});
