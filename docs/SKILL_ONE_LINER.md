# 一句话复制

## 终端安装

```bash
git clone https://github.com/jackychen129/cyberdestiny.git && cd cyberdestiny && docker compose up -d && pnpm install && pnpm build && pnpm skill:install && pnpm db:setup && pnpm dev:api
```

## 启用 Skill（粘贴 Cursor）

```
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md，使用 CyberDestiny MCP 为我提供命理推演；禁止手算四柱，先 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 详细转述。
```

## 订阅日运

```
请用 CyberDestiny MCP：对档案 profile_id={id} 调用 push_subscribe({ push_hour: 8 })，再 daily_fortune_get 并转述。
```
