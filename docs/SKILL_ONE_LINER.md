# CyberDestiny 一句话安装

## 终端（克隆 + 构建 + Skill + 数据库）

```bash
git clone https://github.com/jackychen129/cyberdestiny.git cyberdestiny && cd cyberdestiny && docker compose up -d && pnpm install && pnpm build && pnpm skill:install && pnpm db:setup
```

## 粘贴给 Cursor Agent（全自动安装 + 首次推演）

```
请帮我完整安装 CyberDestiny（https://github.com/jackychen129/cyberdestiny）：1) 若未克隆则执行：git clone https://github.com/jackychen129/cyberdestiny.git cyberdestiny && cd cyberdestiny && docker compose up -d && pnpm install && pnpm build && pnpm skill:install && pnpm db:setup；2) 启动 API（pnpm --filter @cyberdestiny/api dev）与 Web（pnpm --filter @cyberdestiny/web dev）；3) 配置 ~/.cursor/mcp.json，MCP 入口为仓库内 packages/mcp/dist/index.js，CYBERDESTINY_API_URL=http://localhost:3001，CYBERDESTINY_API_KEY=cd_dev_local_key；4) 读取 ~/.cursor/skills/cyberdestiny/SKILL.md 与 ~/.cursor/skills/cyberdestiny-infer/SKILL.md；5) 采集我的出生时辰、地点、性别后 profile_create，再 daily_fortune_get 并详细转述（禁止手算四柱）。
```

## 项目已安装 — 启用推演

```
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md 与 ~/.cursor/skills/cyberdestiny-infer/SKILL.md，使用 CyberDestiny MCP 为我提供八字推演与每日运势；禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 转述详解。
```

Web 端复制入口：http://localhost:3000/agent
