---
name: cyberdestiny-infer
description: CyberDestiny 推演专精 Skill — Agent 代用户完成档案→推演→解读→每日运势的完整流程。用户问八字、日运、问事、订阅推送时使用。
---

# CyberDestiny 推演专精 Skill

## 核心原则

1. **计算走引擎，释象走报告** — 禁止 LLM 手算四柱或卦爻
2. **先报告后对话** — 必须 `destiny_infer` 或 `daily_fortune_get` 再转述
3. **依据可追溯** — 转述时引用 `sections[].basis`
4. **fiction 仅象意** — 一人之下等映射不得独断吉凶

## 快速推演（日运）

```
1. profile_list → 匹配或 profile_create
2. daily_fortune_get({ profile_id })  // 免费、含黄历+典籍+卦
   或 destiny_infer({ profile_id, scope: "day", question? })
3. 转述：summary + 刑冲合害 + 行动建议 + deep_link
```

## 深度推演

| 用户意图 | scope | 积分 |
|----------|-------|------|
| 今天/明日 | day | 1 |
| 本周 | week | 2 |
| 今年/流年 | year | 5 |
| 格局/一生 | lifetime | 10 |

```
destiny_infer({ profile_id, scope, question?, as_of? })
→ report_get({ report_id })
→ 逐章解读 sections（命盘根基、五行、刑冲合害、十神…）
```

## 问事起卦

```
hexagram_cast({ profile_id?, method: "time"|"number", question, numbers? })
classic_search({ query: "世应" })  // 辅助释卦术语
```

## 每日推送

```
push_subscribe({ profile_id, push_hour: 8 })
daily_fortune_get({ profile_id })   // 立即获取今日
push_inbox({ profile_id, limit: 7 }) // 历史七日
```

系统 cron：`node scripts/daily-push-cron.mjs`（调用 `POST /push/run-daily`）

## 一句话复制（Agent 订阅）

用户可从 Web **设置** 或 **日运** 页一键复制；Agent 收到后按下列句式执行：

| 场景 | 复制句式（示例） |
|------|------------------|
| 启用 Skill | `请遵循本项目 skills/cyberdestiny/SKILL.md 与 skills/cyberdestiny-infer/SKILL.md，使用 CyberDestiny MCP…` |
| 订阅日运 | `请用 CyberDestiny MCP：对档案 profile_id={id} 调用 push_subscribe({ push_hour: 8 })…` |
| 今日运势 | `请用 CyberDestiny MCP：profile_id={id} 调用 daily_fortune_get…` |

完整模板见 `packages/shared/src/agent-prompts.ts` 中 `buildDailySubscribePrompt` / `buildAgentSkillPrompt`。

## 典籍引用

```
classic_search({ query: "乾卦" })
science_search({ query: "量子" })     // 现代科学象意
world_pulse_get({ limit: 5 })         // 时事脉搏
classic_search({ query: "道德经", fiction: 1 })
```

内置：易经、道德经、子平命理、天理原则、量子/复杂性科学象意、宏观时势主题；时事 RSS 每 12h 自动刷新。

## 转述模板（必须详细）

```
【{姓名} · {尺度}】{summary}

▎命盘气机
- 日主 / 五行 / 刑冲合害（来自 sections）

▎典籍象意
- {classic.title}：{一句应用}

▎行动
- recommendations[0..2]
- practice_hint[0]

▎完整报告：{deep_link}
▎免责：文化学习参考，非专业建议
```

## 信息采集清单

- [ ] **出生日期时间**（精确到分钟）或 quick_input YYYYMMDDHHmm
- [ ] **出生时辰是否准确** — 不详则勾选/标注，时柱权重约 1/4
- [ ] **出生地点** — 真太阳时校正（省市区即可，如「四川成都」）
- [ ] **性别** — 决定大运顺逆（男/女）
- [ ] **现居地**（可选）— 流年方位与行事环境
- [ ] **职业/行业**（可选）— 财官印食伤对题解读
- [ ] **问事主题** — 事业/感情/健康/投资等
- [ ] 是否缺时辰 → 报告 `missing_inputs` + 「精准提升指引」章

### 匿名推演

- 每浏览器 **仅一条** guest 档案（`X-Guest-Session`），**不保存姓名**，显示为「匿名命主」
- 登录后可创建多个具名档案

## 错误处理

| 错误 | 处理 |
|------|------|
| INSUFFICIENT_CREDITS | 提示设置页充值/API Key |
| PROFILE_NOT_FOUND | profile_create |
| API 不可达 | 检查 CYBERDESTINY_API_URL |

## MCP 环境

见 `docs/AGENT_SETUP.md`。推演相关工具：`profile_*`、`destiny_infer`、`report_get`、`daily_fortune_get`、`push_*`、`hexagram_cast`、`classic_search`。
