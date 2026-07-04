#!/usr/bin/env node
/** 从 monorepo 同步 Skill 专用 GitHub 仓库目录 skill-github/ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'skill-github');
const GITHUB_REPO = 'jackychen129/cyberdestiny';
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function write(file, content) {
  const p = path.join(OUT, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

// clean output
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

copyDir(path.join(ROOT, 'skills', 'cyberdestiny'), path.join(OUT, 'skills', 'cyberdestiny'));
copyDir(path.join(ROOT, 'skills', 'cyberdestiny-infer'), path.join(OUT, 'skills', 'cyberdestiny-infer'));
copyDir(path.join(ROOT, 'skills', 'cyberdestiny'), path.join(OUT, '.cursor', 'skills', 'cyberdestiny'));
copyDir(path.join(ROOT, 'skills', 'cyberdestiny-infer'), path.join(OUT, '.cursor', 'skills', 'cyberdestiny-infer'));
fs.copyFileSync(path.join(ROOT, 'LICENSE'), path.join(OUT, 'LICENSE'));
fs.mkdirSync(path.join(OUT, 'scripts'), { recursive: true });
fs.copyFileSync(
  path.join(ROOT, 'scripts', 'install-skill-standalone.mjs'),
  path.join(OUT, 'scripts', 'install-skill.mjs'),
);

write(
  'README.md',
  `# CyberDestiny · Cursor Agent Skill

赛博天命 Agent Skill — 教 Cursor / OpenClaw **何时调用命理 MCP、如何采集出生信息、如何转述推演报告**。

> 本仓库 **仅含 Skill 文件**。推演引擎与 MCP Server 需自行部署 API（默认 \`http://localhost:3001\`），Skill 通过 MCP 调用。

## 一句话安装

\`\`\`bash
git clone ${GITHUB_URL}.git cyberdestiny-skill && cd cyberdestiny-skill && node scripts/install-skill.mjs
\`\`\`

安装到：

- \`~/.cursor/skills/cyberdestiny/\`
- \`~/.cursor/skills/cyberdestiny-infer/\`

**重启 Cursor** 后生效。

## 粘贴给 Agent（启用推演）

\`\`\`
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md 与 ~/.cursor/skills/cyberdestiny-infer/SKILL.md，使用 CyberDestiny MCP 为我提供八字推演与每日运势；禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 转述详解。
\`\`\`

## MCP 配置（需已运行 CyberDestiny API）

在 \`~/.cursor/mcp.json\` 添加（\`args\` 改为你本机 MCP 入口路径）：

\`\`\`json
{
  "mcpServers": {
    "cyberdestiny": {
      "command": "node",
      "args": ["/path/to/cyberdestiny/packages/mcp/dist/index.js"],
      "env": {
        "CYBERDESTINY_API_URL": "http://localhost:3001",
        "CYBERDESTINY_API_KEY": "cd_dev_local_key"
      }
    }
  }
}
\`\`\`

## 仓库结构

| 路径 | 说明 |
|------|------|
| \`skills/cyberdestiny/SKILL.md\` | 主 Skill：MCP 工具、安装、转述规范 |
| \`skills/cyberdestiny-infer/SKILL.md\` | 推演专精：档案→推演→日运订阅 |
| \`docs/SKILL_ONE_LINER.md\` | 一句话复制合集 |

## 许可证

[MIT](LICENSE)
`,
);

write(
  'docs/SKILL_ONE_LINER.md',
  `# 一句话复制

## 终端安装 Skill

\`\`\`bash
git clone ${GITHUB_URL}.git cyberdestiny-skill && cd cyberdestiny-skill && node scripts/install-skill.mjs
\`\`\`

## 启用推演（粘贴 Cursor）

\`\`\`
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md 与 ~/.cursor/skills/cyberdestiny-infer/SKILL.md，使用 CyberDestiny MCP 为我提供八字推演与每日运势；禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 转述详解。
\`\`\`

## 订阅日运

\`\`\`
请用 CyberDestiny MCP：对档案 profile_id={id} 调用 push_subscribe({ push_hour: 8 }) 订阅每日运势，再 daily_fortune_get 展示今日摘要、刑冲合害与行动建议，并遵循 ~/.cursor/skills/cyberdestiny-infer/SKILL.md 转述。
\`\`\`
`,
);

write(
  'docs/AGENT_SETUP.md',
  `# Agent Skill 安装说明

本仓库为 **Cursor Agent Skill 专用**。完整 Web/API 平台不在 GitHub 公开发布。

## 1. 安装 Skill

\`\`\`bash
git clone ${GITHUB_URL}.git
cd cyberdestiny
node scripts/install-skill.mjs
\`\`\`

## 2. 配置 MCP

Skill 依赖 CyberDestiny MCP 工具。请确保：

1. API 运行于 \`http://localhost:3001\`（或修改 \`CYBERDESTINY_API_URL\`）
2. \`~/.cursor/mcp.json\` 已配置 \`cyberdestiny\` server
3. 重启 Cursor

## 3. 验证

在 Agent 对话粘贴 \`docs/SKILL_ONE_LINER.md\` 中的启用句，Agent 应调用 \`profile_list\` / \`daily_fortune_get\` 等工具。

## 免责声明

推演用于自我反思与文化学习参考，不构成医疗、法律或投资建议。
`,
);

write(
  'package.json',
  JSON.stringify(
    {
      name: 'cyberdestiny-skill',
      version: '1.0.0',
      description: 'CyberDestiny Cursor Agent Skill — 命理推演 MCP 集成',
      private: false,
      license: 'MIT',
      repository: {
        type: 'git',
        url: `${GITHUB_URL}.git`,
      },
      scripts: {
        install: 'node scripts/install-skill.mjs',
      },
    },
    null,
    2,
  ) + '\n',
);

write(
  '.gitignore',
  `node_modules/
.DS_Store
`,
);

// Patch SKILL.md install section in output
const mainSkillPath = path.join(OUT, 'skills', 'cyberdestiny', 'SKILL.md');
let mainSkill = fs.readFileSync(mainSkillPath, 'utf8');
mainSkill = mainSkill.replace(
  /## 安装与配置[\s\S]*?## 工具清单/,
  `## 安装与配置

**GitHub（本仓库，仅 Skill）**：${GITHUB_URL}

**一句话安装**：

\`\`\`bash
git clone ${GITHUB_URL}.git cyberdestiny-skill && cd cyberdestiny-skill && node scripts/install-skill.mjs
\`\`\`

MCP / API 需自行部署（默认 \`http://localhost:3001\`）。详见 \`docs/AGENT_SETUP.md\`。

### 安装到 Cursor

\`\`\`bash
node scripts/install-skill.mjs
\`\`\`

- **个人级**：\`~/.cursor/skills/cyberdestiny/\` 与 \`cyberdestiny-infer/\`
- **项目级**：克隆后 \`.cursor/skills/\` 可直接被 Cursor 发现

### 一句话启用

\`\`\`
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md 与 ~/.cursor/skills/cyberdestiny-infer/SKILL.md，使用 CyberDestiny MCP 为我提供八字推演与每日运势；禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 转述详解。
\`\`\`

## 工具清单`,
);
mainSkill = mainSkill.replace('模板源码：`packages/shared/src/agent-prompts.ts`', '详见 `docs/SKILL_ONE_LINER.md`');
fs.writeFileSync(mainSkillPath, mainSkill);
fs.writeFileSync(path.join(OUT, '.cursor', 'skills', 'cyberdestiny', 'SKILL.md'), mainSkill);

console.log('✓ synced skill-github/');
