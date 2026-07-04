#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'skill-github');

execSync('node scripts/sync-skill-github.mjs', { cwd: ROOT, stdio: 'inherit' });

const gitDir = path.join(OUT, '.git');
try {
  execSync('git rev-parse --git-dir', { cwd: OUT, stdio: 'pipe' });
} catch {
  execSync('git init -b main', { cwd: OUT, stdio: 'inherit' });
  execSync('git remote add origin git@github.com:jackychen129/cyberdestiny.git', { cwd: OUT, stdio: 'inherit' });
}

execSync('git add -A', { cwd: OUT, stdio: 'inherit' });
try {
  execSync('git diff --cached --quiet', { cwd: OUT, stdio: 'pipe' });
  console.log('· skill-github 无变更，跳过 commit');
} catch {
  execSync('git commit -m "chore: sync CyberDestiny Agent Skill"', { cwd: OUT, stdio: 'inherit' });
}
execSync('git push -f origin main', { cwd: OUT, stdio: 'inherit' });
console.log('\n✅ GitHub 已更新为 Skill 专用仓库: https://github.com/jackychen129/cyberdestiny');
