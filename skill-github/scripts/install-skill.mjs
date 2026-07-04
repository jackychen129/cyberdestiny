#!/usr/bin/env node
/** Skill 专用仓库的安装脚本（无 MCP 路径依赖） */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SKILL_NAMES = ['cyberdestiny', 'cyberdestiny-infer'];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function installTo(baseDir, label) {
  for (const name of SKILL_NAMES) {
    const src = path.join(REPO_ROOT, 'skills', name);
    const dest = path.join(baseDir, name);
    if (!fs.existsSync(src)) continue;
    fs.rmSync(dest, { recursive: true, force: true });
    copyDir(src, dest);
    console.log(`✓ ${label}: ${dest}`);
  }
}

installTo(path.join(os.homedir(), '.cursor', 'skills'), '个人 Skill');
installTo(path.join(REPO_ROOT, '.cursor', 'skills'), '项目 Skill');

console.log('\n✅ CyberDestiny Skill 安装完成');
console.log('  配置 MCP 见 docs/AGENT_SETUP.md，重启 Cursor 后粘贴 docs/SKILL_ONE_LINER.md 启用句。');
