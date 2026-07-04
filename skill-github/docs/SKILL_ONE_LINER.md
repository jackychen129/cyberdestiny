# 一句话复制

## 终端安装 Skill

```bash
git clone https://github.com/jackychen129/cyberdestiny.git cyberdestiny-skill && cd cyberdestiny-skill && node scripts/install-skill.mjs
```

## 启用推演（粘贴 Cursor）

```
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md 与 ~/.cursor/skills/cyberdestiny-infer/SKILL.md，使用 CyberDestiny MCP 为我提供八字推演与每日运势；禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 转述详解。
```

## 订阅日运

```
请用 CyberDestiny MCP：对档案 profile_id={id} 调用 push_subscribe({ push_hour: 8 }) 订阅每日运势，再 daily_fortune_get 展示今日摘要、刑冲合害与行动建议，并遵循 ~/.cursor/skills/cyberdestiny-infer/SKILL.md 转述。
```
