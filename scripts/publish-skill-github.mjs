#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'skill-github');
const REMOTE = 'git@github.com:jackychen129/cyberdestiny.git';

function run(cmd) {
  execSync(cmd, { cwd: OUT, stdio: 'inherit' });
}

execSync('node scripts/sync-skill-github.mjs', { cwd: ROOT, stdio: 'inherit' });

// 独立 git 仓库，避免继承 monorepo 的 .git
const gitDir = path.join(OUT, '.git');
if (fs.existsSync(gitDir)) fs.rmSync(gitDir, { recursive: true, force: true });

run('git init -b main');
run(`git remote add origin ${REMOTE}`);

run('git add -A');
run('git commit -m "chore: CyberDestiny Agent Skill only"');
run('git push -f origin main');

console.log('\n✅ GitHub 已更新为 Skill 专用仓库: https://github.com/jackychen129/cyberdestiny');
