---
name: cyberdestiny
description: CyberDestiny 赛博天命 — 命理推演 MCP/REST 集成 Skill。教 Agent 何时调用推演、如何采集信息、如何转述报告。用户询问八字、运势、六爻、修行或需配置 MCP 时使用。
---

# CyberDestiny Agent Skill

## 何时使用

当用户询问以下话题时，使用 CyberDestiny MCP 工具：

- 八字、日运、周运、年运、流年、大运、一生格局
- 六爻起卦、问事
- 命理档案管理
- 修行功课、21 天径
- 配置 Agent / MCP / API Key

## 安装与配置

**GitHub**：https://github.com/jackychen129/cyberdestiny

**一句话安装**（终端）：

```bash
git clone https://github.com/jackychen129/cyberdestiny.git cyberdestiny && cd cyberdestiny && docker compose up -d && pnpm install && pnpm build && pnpm skill:install && pnpm db:setup
```

完整步骤见 **`docs/AGENT_SETUP.md`**、**`docs/SKILL_ONE_LINER.md`**。Web 复制：http://localhost:3000/agent

### 1. 构建 MCP

```bash
cd cyberdestiny && pnpm install && pnpm build
```

### 2. Cursor MCP 配置（`~/.cursor/mcp.json` 或项目 `.cursor/mcp.json`）

```json
{
  "mcpServers": {
    "cyberdestiny": {
      "command": "node",
      "args": ["/绝对路径/cyberdestiny/packages/mcp/dist/index.js"],
      "env": {
        "CYBERDESTINY_API_URL": "http://localhost:3001",
        "CYBERDESTINY_API_KEY": "从 Web 设置页复制的 Personal API Key"
      }
    }
  }
}
```

### 3. 用户登录与 API Key

1. Web 打开 http://localhost:3000/login → **Google 登录**（需配置 `GOOGLE_CLIENT_ID`）
2. 进入 **设置** 复制 Personal API Key
3. 填入 MCP 的 `CYBERDESTINY_API_KEY`
4. Web 与 Agent **共享**档案、报告、积分

本地无 Google 配置时可用 `DEV_API_KEY=cd_dev_local_key`（仅开发）。

### 4. 安装本 Skill

```bash
pnpm skill:install
```

- **个人级**：`~/.cursor/skills/cyberdestiny/` 与 `cyberdestiny-infer/`
- **项目级**：`.cursor/skills/`（克隆仓库后自动可用）

### 5. 一句话复制（用户订阅 Agent）

Web **设置 → Agent 一句话订阅** 或 **日运页** 提供复制按钮。用户粘贴到 Agent 对话即可触发 Skill + MCP 流程。

```
请遵循本项目 skills/cyberdestiny/SKILL.md 与 skills/cyberdestiny-infer/SKILL.md，使用 CyberDestiny MCP 为我提供八字推演与每日运势；禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 转述详解。
```

订阅日运（替换 `{profile_id}`）：

```
请用 CyberDestiny MCP：对档案 profile_id={profile_id} 调用 push_subscribe({ push_hour: 8 }) 订阅每日运势，再 daily_fortune_get 展示今日摘要、刑冲合害与行动建议，并遵循 skills/cyberdestiny-infer/SKILL.md 转述。
```

模板源码：`packages/shared/src/agent-prompts.ts`

## 工具清单

| Tool | 用途 |
|------|------|
| `profile_create` | 创建命理档案 |
| `profile_get` / `profile_list` | 查询档案 |
| `destiny_infer` | 核心推演（day/week/year/lifetime） |
| `report_get` | 获取完整报告（含详细章节） |
| `report_qa` | 基于报告追问 |
| `hexagram_cast` | 六爻起卦 |
| `profile_pair` | 合盘 |
| `almanac_get` | 黄历 |
| `classic_search` | 典籍检索（支持 tradition 过滤） |
| `knowledge_stats` | 知识库规模统计 |
| `science_search` / `world_pulse_get` | 现代科学象意 / 时事脉搏 |
| `world_context_refresh` | 刷新 RSS 时事入库 |
| `practice_recommend` / `practice_check_in` / `practice_start_21day` | 修行 |
| `case_snapshot` | 案例库 |
| `billing_balance` | 积分余额 |
| `daily_fortune_get` | 今日运势（免费，含黄历/典籍/卦） |
| `push_subscribe` / `push_inbox` | 每日推送订阅与收件箱 |

## 推演专精 Skill

深度推演流程见 **`skills/cyberdestiny-infer/SKILL.md`**（档案→推演→解读→日运订阅）。

1. **出生时间**：精确到分钟；ISO 8601 或 `YYYYMMDDHHmm`
2. **缺时辰**：说明降精度；建议补全
3. **出生地点**：真太阳时校正，强烈建议
4. **问事**：采集 `question` + `question_type`
5. **尺度**：默认 `day`；问全年用 `year`；问格局用 `lifetime`

## 推荐流程

```
1. profile_create 或 profile_list
2. destiny_infer({ profile_id, scope, question? })
3. report_get({ report_id }) — 获取完整 sections 详解
4. 转述：摘要 + 各章要点 + 依据 + 行动建议
5. 追问 → report_qa
```

## 转述模板（运势须详细）

报告含多章详解，转述时**不可只给一句话**：

1. **摘要**：`summary` 总论
2. **命盘根基**：日主、五行、喜忌
3. **气机详解**：当日/本周/流年主题
4. **行动建议**：`recommendations` + `practice_hint`
5. **timeline**：周运/年运逐日/逐月要点
6. **Deep link**：`/reports/{id}`
7. **fiction**：标注「象意参考」

## 禁止事项

- 不代替医疗 / 法律 / 投资唯一依据
- 不让 LLM 手算四柱 — 必须走 `destiny_infer`
- 不做法事、符箓建议

## 免责声明

推演用于自我反思与文化学习参考，不构成专业建议。
