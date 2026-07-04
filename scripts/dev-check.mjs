#!/usr/bin/env node
/** 检查 API + Web 是否就绪 */
const API = process.env.API_URL ?? 'http://localhost:3001';
const WEB = process.env.WEB_URL ?? 'http://localhost:3000';

async function check(label, url) {
  try {
    const res = await fetch(url);
    console.log(res.ok ? `  ✓ ${label} ${url}` : `  ✗ ${label} ${url} → HTTP ${res.status}`);
    return res.ok;
  } catch {
    console.log(`  ✗ ${label} 未启动 ${url}`);
    return false;
  }
}

async function main() {
  console.log('CyberDestiny 服务检查\n');
  const api = await check('API', `${API}/health`);
  const web = await check('Web', WEB);
  if (!api || !web) {
    console.log('\n启动方式（需两个终端，或根目录 pnpm dev）：');
    console.log('  pnpm --filter @cyberdestiny/api dev   # :3001');
    console.log('  pnpm --filter @cyberdestiny/web dev   # :3000');
    process.exit(1);
  }
  console.log('\n✅ 服务正常，打开 http://localhost:3000');
}

main();
