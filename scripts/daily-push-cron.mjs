#!/usr/bin/env node
/** 每日运势推送 cron — 配合系统 crontab 或 GitHub Actions 调用 */
const API = process.env.API_URL ?? 'http://localhost:3001';

async function main() {
  console.log('CyberDestiny 每日推送', new Date().toISOString());
  const res = await fetch(API + '/push/run-daily', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) {
    console.error('失败:', data);
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
  const failed = data.results?.filter((r) => !r.ok).length ?? 0;
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
