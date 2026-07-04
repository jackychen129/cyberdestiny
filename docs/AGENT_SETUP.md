# CyberDestiny Agent Skill 安装指南

本仓库 = **业界最全命理推演 Cursor Skill** + MCP + API 引擎。**无 Web 界面**，一切通过 Agent 对话完成。

## 一句话安装

```bash
git clone https://github.com/jackychen129/cyberdestiny.git && cd cyberdestiny && docker compose up -d && pnpm install && pnpm build && pnpm skill:install && pnpm db:setup
```

## 启动推演引擎

```bash
pnpm dev:api    # http://localhost:3001
pnpm dev:check  # 健康检查
```

## Cursor MCP

`pnpm skill:install` 会写入 `~/.cursor/skills/cyberdestiny/SKILL.md` 与 `~/.cursor/mcp.json`（若不存在）。

手动配置见 [SKILL.md](../SKILL.md) 中 MCP 章节。

## API Key

本地开发默认：`cd_dev_local_key`（`.env` 中 `DEV_API_KEY`）

## 粘贴给 Agent

```
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md，使用 CyberDestiny MCP 为我提供命理推演；禁止手算四柱，先 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 详细转述。
```

## MCP 工具（26 个）

见 [SKILL.md](../SKILL.md) 能力地图。

## 定时任务

```bash
pnpm push:daily      # 日运推送 cron
pnpm world:refresh   # 时事 RSS 刷新
```

## 验证

```bash
pnpm test:e2e
```

## 免责声明

推演用于自我反思与文化学习参考，不构成医疗、法律或投资建议。
