#!/usr/bin/env node
/** API 完整 E2E — 同 e2e-smoke，保留扩展钩子 */
import { spawn } from 'node:child_process';

const child = spawn('node', ['scripts/e2e-smoke.mjs'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 1));
