#!/usr/bin/env node
/**
 * 安装 CyberDestiny Cursor Skills
 * - 项目级：.cursor/skills/
 * - 个人级：~/.cursor/skills/
 */
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
    if (!fs.existsSync(src)) {
      console.warn(`⚠ 跳过 ${name}：源目录不存在 ${src}`);
      continue;
    }
    fs.rmSync(dest, { recursive: true, force: true });
    copyDir(src, dest);
    console.log(`✓ ${label}: ${dest}`);
  }
}

const homeSkills = path.join(os.homedir(), '.cursor', 'skills');
const projectSkills = path.join(REPO_ROOT, '.cursor', 'skills');

installTo(homeSkills, '个人 Skill');
installTo(projectSkills, '项目 Skill');

const mcpExample = path.join(REPO_ROOT, '.cursor', 'mcp.json.example');
const mcpDest = path.join(os.homedir(), '.cursor', 'mcp.json');
const mcpPath = path.join(REPO_ROOT, 'packages', 'mcp', 'dist', 'index.js');

if (fs.existsSync(mcpExample) && !fs.existsSync(mcpDest)) {
  const raw = fs.readFileSync(mcpExample, 'utf8');
  const filled = raw
    .replace('__CYBERDESTINY_REPO__', REPO_ROOT)
    .replace('__MCP_ENTRY__', mcpPath);
  fs.mkdirSync(path.dirname(mcpDest), { recursive: true });
  fs.writeFileSync(mcpDest, filled);
  console.log(`✓ MCP 示例已写入 ${mcpDest}（首次安装）`);
} else if (fs.existsSync(mcpDest)) {
  console.log(`· MCP 已存在 ${mcpDest}，未覆盖`);
}

console.log('\n✅ CyberDestiny Skill 安装完成');
console.log('  重启 Cursor 后在 Agent 对话粘贴 docs/SKILL_ONE_LINER.md 中的句子即可使用。');
