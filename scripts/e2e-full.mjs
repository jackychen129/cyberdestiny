#!/usr/bin/env node
/**
 * CyberDestiny 完整端到端测试 — API + Web 页面 + 用户流程
 * 需要 API :3001 与 Web :3000 均已启动
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const API = process.env.API_URL ?? 'http://localhost:3001';
const WEB = process.env.WEB_URL ?? 'http://localhost:3000';
const API_KEY = process.env.DEV_API_KEY ?? 'cd_dev_local_key';

const WEB_ROUTES = [
  { path: '/', mustContain: ['赛博天命', '开始推演'] },
  { path: '/profiles', mustContain: ['档案'] },
  { path: '/infer', mustContain: ['推演工作台'] },
  { path: '/pair', mustContain: ['合盘'] },
  { path: '/knowledge', mustContain: ['典籍'] },
  { path: '/practice', mustContain: ['修行中心'] },
  { path: '/almanac', mustContain: ['黄历'] },
];

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✓ ${label}`);
  passed++;
}

function fail(label, detail) {
  console.log(`  ✗ ${label}: ${detail}`);
  failed++;
}

async function req(method, path, body, opts = {}) {
  const headers = { ...(opts.headers ?? {}) };
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

async function checkWebPage({ path, mustContain }) {
  const url = `${WEB}${path}`;
  const res = await fetch(url, { headers: { Accept: 'text/html' } });
  const html = await res.text();
  if (!res.ok) {
    fail(`Web ${path}`, `HTTP ${res.status}`);
    return;
  }
  for (const text of mustContain) {
    if (!html.includes(text)) {
      fail(`Web ${path}`, `缺少文案「${text}」`);
      return;
    }
  }
  ok(`Web ${path} (${res.status})`);
}

async function checkCors() {
  const res = await fetch(`${API}/profiles`, {
    headers: {
      Origin: WEB,
      Accept: 'application/json',
    },
  });
  const allowOrigin = res.headers.get('access-control-allow-origin');
  if (!res.ok) {
    fail('CORS /profiles', `HTTP ${res.status}`);
    return;
  }
  if (allowOrigin !== WEB && allowOrigin !== '*') {
    fail('CORS', `Access-Control-Allow-Origin=${allowOrigin ?? 'missing'}`);
    return;
  }
  ok(`CORS API←Web (${allowOrigin})`);
}

async function checkWebApiIntegration() {
  const res = await fetch(`${API}/profiles`, {
    headers: { Origin: WEB, Accept: 'application/json' },
  });
  const data = await res.json();
  if (!Array.isArray(data.items)) {
    fail('Web→API profiles', '响应格式错误');
    return;
  }
  ok(`Web→API profiles (${data.items.length} 条)`);
}

async function runApiFlow() {
  const profile = await req('POST', '/profiles', {
    name: 'E2E全链路',
    gender: 'male',
    birth_datetime: '1990-05-05T12:00:00+08:00',
    birth_place: '成都',
  });
  ok(`API 创建档案 ${profile.id.slice(0, 8)}…`);

  const infer = await req(
    'POST',
    '/destiny_infer',
    { profile_id: profile.id, scope: 'day' },
    { headers: { 'X-API-Key': API_KEY } },
  );
  ok(`API 推演 report=${infer.report_id.slice(0, 8)}…`);

  const reportRes = await fetch(`${WEB}/reports/${infer.report_id}`, {
    headers: { Accept: 'text/html' },
  });
  const reportHtml = await reportRes.text();
  if (!reportRes.ok) {
    fail(`Web 报告页 /reports/${infer.report_id}`, `HTTP ${reportRes.status}`);
    return;
  }
  if (!reportHtml.includes('推演报告') && !reportHtml.includes('加载报告')) {
    fail('Web 报告页', '页面无报告壳内容');
    return;
  }
  ok(`Web 报告页 /reports/${infer.report_id}`);

  const plan = await req('POST', '/practice/start-21day', { profile_id: profile.id });
  await req('POST', '/practice/check-in', {
    practice_plan_id: plan.practice_plan_id,
    duration_minutes: 10,
  });
  ok('API 修行 21天+打卡');

  const snap = await req('POST', '/cases/snapshot', {
    profile_id: profile.id,
    report_id: infer.report_id,
    label: 'E2E全链路',
  });
  ok(`API 案例库 ${snap.case_id.slice(0, 8)}…`);
}

async function waitFor(url, label, maxMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      /* retry */
    }
    await sleep(1000);
  }
  throw new Error(`${label} 未在 ${maxMs / 1000}s 内就绪: ${url}`);
}

async function main() {
  const autoStart = process.argv.includes('--start');

  console.log('🧪 CyberDestiny 完整 E2E\n');
  console.log(`  API: ${API}`);
  console.log(`  Web: ${WEB}\n`);

  let apiProc;
  let webProc;

  if (autoStart) {
    console.log('⏳ 自动启动 API 与 Web…\n');
    apiProc = spawn('pnpm', ['--filter', '@cyberdestiny/api', 'dev'], {
      cwd: new URL('..', import.meta.url).pathname,
      stdio: 'pipe',
      shell: true,
    });
    webProc = spawn('pnpm', ['--filter', '@cyberdestiny/web', 'dev'], {
      cwd: new URL('..', import.meta.url).pathname,
      stdio: 'pipe',
      shell: true,
    });
    await waitFor(`${API}/health`, 'API');
    await waitFor(WEB, 'Web');
    console.log('  服务已就绪\n');
  } else {
    try {
      await waitFor(`${API}/health`, 'API', 3000);
      await waitFor(WEB, 'Web', 3000);
    } catch (e) {
      console.error(`\n❌ ${e.message}`);
      console.error('\n请先启动服务：');
      console.error('  pnpm --filter @cyberdestiny/api dev');
      console.error('  pnpm --filter @cyberdestiny/web dev');
      console.error('\n或运行: node scripts/e2e-full.mjs --start\n');
      process.exit(1);
    }
  }

  console.log('── Web 页面可达性 ──');
  for (const route of WEB_ROUTES) {
    await checkWebPage(route);
  }

  console.log('\n── CORS / 前后端联通 ──');
  await checkCors();
  await checkWebApiIntegration();

  console.log('\n── API 业务流程 ──');
  try {
    await runApiFlow();
  } catch (e) {
    fail('API 流程', e instanceof Error ? e.message : String(e));
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`结果: ${passed} 通过, ${failed} 失败`);

  if (apiProc) apiProc.kill();
  if (webProc) webProc.kill();

  if (failed > 0) process.exit(1);
  console.log('\n✅ 完整 E2E 全部通过');
}

main().catch((e) => {
  console.error('\n❌', e.message);
  process.exit(1);
});
