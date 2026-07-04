#!/usr/bin/env node
/**
 * 安装 CyberDestiny Skill 到 Cursor + 写入 MCP 配置
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SKILL_SRC = path.join(REPO_ROOT, 'SKILL.md');
const SKILL_NAME = 'cyberdestiny';

function copySkill(destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, SKILL_NAME, 'SKILL.md');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(SKILL_SRC, dest);
  console.log(`✓ Skill: ${dest}`);
}

copySkill(path.join(os.homedir(), '.cursor', 'skills'));
copySkill(path.join(REPO_ROOT, '.cursor', 'skills'));

const mcpEntry = path.join(REPO_ROOT, 'packages', 'mcp', 'dist', 'index.js');
const mcpExample = {
  mcpServers: {
    cyberdestiny: {
      command: 'node',
      args: [mcpEntry],
      env: {
        CYBERDESTINY_API_URL: 'http://localhost:3001',
        CYBERDESTINY_API_KEY: process.env.DEV_API_KEY ?? 'cd_dev_local_key',
      },
    },
  },
};

const mcpDest = path.join(os.homedir(), '.cursor', 'mcp.json');
if (!fs.existsSync(mcpDest)) {
  fs.mkdirSync(path.dirname(mcpDest), { recursive: true });
  fs.writeFileSync(mcpDest, JSON.stringify(mcpExample, null, 2) + '\n');
  console.log(`✓ MCP 配置: ${mcpDest}`);
} else {
  console.log(`· MCP 已存在 ${mcpDest}，请手动添加 cyberdestiny server`);
}

console.log('\n✅ 安装完成。启动 API: pnpm dev:api');
console.log('   重启 Cursor 后粘贴 README 中的 Agent 启用句。');
