#!/usr/bin/env node
/** 时事脉搏刷新 cron — 建议每 6–12 小时执行 */
const API = process.env.API_URL ?? 'http://localhost:3001';

async function main() {
  console.log('CyberDestiny 时事刷新', new Date().toISOString());
  const res = await fetch(API + '/knowledge/refresh-world', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) {
    console.error('失败:', data);
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
