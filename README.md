# CyberDestiny · 赛博天命

**业界功能最全的 Cursor Agent 命理推演 Skill** — 八字、神煞、紫微、奇门、梅花、六壬、择日、六爻、合盘、黄历、典籍 RAG、科学象意、修行径、日运订阅，一体化 MCP 驱动。

> 顺时而为，尽其天性 · 计算走引擎，释象走报告

[![GitHub](https://img.shields.io/github/stars/jackychen129/cyberdestiny?style=social)](https://github.com/jackychen129/cyberdestiny)

## 这是什么

不是 Web 应用，而是 **Agent Skill + 推演引擎**：

| 组件 | 作用 |
|------|------|
| `SKILL.md` | 教 Cursor/OpenClaw 何时调用、如何采集、如何转述 |
| `packages/mcp` | 35 个 MCP 工具，Agent 专用接口 |
| `apps/api` | 确定性排盘、规则引擎、报告生成 |
| `packages/chart-engine` | 四柱、神煞、紫微、奇门、梅花、六壬、六爻、黄历、择日 |

## 一句话安装

```bash
git clone https://github.com/jackychen129/cyberdestiny.git && cd cyberdestiny && docker compose up -d && pnpm install && pnpm build && pnpm skill:install && pnpm db:setup
```

启动引擎：

```bash
pnpm dev:api
```

粘贴给 Cursor Agent：

```
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md，使用 CyberDestiny MCP 为我提供命理推演；禁止手算四柱，先 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 详细转述。
```

## 能力一览

- **四柱八字** — 真太阳时、刑冲合害、十神、大运流年、神煞
- **紫微斗数** — 十二宫盘 + 八字交叉印证（`ziwei_chart` / `bazi_ziwei_cross`）
- **奇门梅花六壬** — 九宫奇门、梅花体用、大六壬三传、小六壬六宫
- **推演尺度** — 日 / 周 / 年 / 一生（`destiny_infer`）
- **六爻起卦** — 时间卦、数字卦（`hexagram_cast`）
- **合盘** — 感情 / 合作 / 综合（`profile_pair`）
- **黄历择日** — 宜忌、建除、时辰、活动择日（`almanac_*` / `zeri_select`）
- **典籍 RAG** — 270+ 条：易经、道德、子平、天理（`classic_search`）
- **科学象意** — 量子、复杂性科学（`science_search`）
- **时事脉搏** — RSS 宏观主题（`world_pulse_get`）
- **日运订阅** — 免费日运 + inbox（`daily_fortune_get` / `push_*`）
- **修行径** — 21 天打卡、知命改命（`practice_*`）
- **案例库** — 报告快照（`case_snapshot`）

完整工具说明见 **[SKILL.md](SKILL.md)**。

## 开发

```bash
pnpm dev:api          # API :3001
pnpm test:e2e         # 端到端（需 API 运行）
pnpm skill:install    # 安装 Skill + MCP 到 ~/.cursor/
pnpm --filter @cyberdestiny/chart-engine test
```

## 目录

```
cyberdestiny/
├── SKILL.md              # 主 Skill（业界最全）
├── apps/api/             # 推演 API
├── packages/
│   ├── chart-engine/     # 确定性算法
│   ├── mcp/              # MCP Server
│   └── shared/           # 类型与 Schema
├── scripts/              # 安装、E2E、cron
└── docs/AGENT_SETUP.md
```

## 许可证

[MIT](LICENSE)
