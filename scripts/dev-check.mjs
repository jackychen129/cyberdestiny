#!/usr/bin/env node
const API = process.env.API_URL ?? 'http://localhost:3001';

async function check(url, label) {
  try {
    const res = await fetch(url);
    console.log(res.ok ? `✓ ${label}` : `✗ ${label} → ${res.status}`);
    return res.ok;
  } catch {
    console.log(`✗ ${label} 不可达`);
    return false;
  }
}

const apiOk = await check(`${API}/health`, 'API');
if (apiOk) {
  const h = await fetch(`${API}/health`).then((r) => r.json());
  console.log('  ', h);
}
console.log(apiOk ? '\n✅ 推演引擎就绪，重启 Cursor 后使用 SKILL.md' : '\n❌ 请先 pnpm dev:api');
