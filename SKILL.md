---
name: cyberdestiny
description: >-
  CyberDestiny 赛博天命 — 业界最全 Cursor 命理推演 Skill。覆盖八字四柱、神煞、真太阳时、
  刑冲合害、紫微斗数、奇门遁甲、梅花易数、大六壬、小六壬、择日、日/周/年/一生推演、
  六爻起卦、八字紫微交叉印证、合盘、黄历、270+ 典籍 RAG、科学象意、
  时事脉搏、21 天修行径、日运订阅。用户问八字、运势、问事、改命、Agent 配置时使用。
  计算走 MCP 引擎，禁止 LLM 手算四柱。
---

# CyberDestiny · 赛博天命

**业界功能最全的 Agent 命理推演 Skill** — 顺时而为，尽其天性。

## 核心原则（必须遵守）

1. **计算走引擎，释象走报告** — 禁止 LLM 手算四柱、卦爻、大运
2. **先报告后对话** — 必须 `destiny_infer` / `daily_fortune_get` / `hexagram_cast` 再转述
3. **依据可追溯** — 转述时引用 `sections[].basis` 或 `basis_type`
4. **信息越全越准** — 缺时辰/出生地/性别时主动说明并建议补全
5. **fiction 仅象意** — 文艺映射不得独断吉凶

## 一句话安装

```bash
git clone https://github.com/jackychen129/cyberdestiny.git && cd cyberdestiny && docker compose up -d && pnpm install && pnpm build && pnpm skill:install && pnpm db:setup && pnpm dev:api
```

粘贴给 Agent 启用：

```
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md，使用 CyberDestiny MCP 为我提供命理推演；禁止手算四柱，先 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 详细转述。
```

---

## 能力地图

| 领域 | MCP 工具 | 说明 |
|------|----------|------|
| 档案 | `profile_create` `profile_get` `profile_list` | 出生信息、真太阳时 |
| 推演 | `destiny_infer` `report_get` `report_qa` | day/week/year/lifetime |
| 日运 | `daily_fortune_get` `push_subscribe` `push_inbox` | 免费日运 + 订阅 |
| 六爻 | `hexagram_cast` | 时间/数字起卦 |
| 梅花 | `meihua_cast` | 体用生克、数字/时间起卦 |
| 奇门 | `qimen_chart` | 九宫门星神 |
| 六壬 | `liuren_cast` `xiaoliuren_cast` | 大六壬四课三传 / 小六壬六宫 |
| 紫微 | `ziwei_chart` `bazi_ziwei_cross` | 十二宫 + 八字交叉印证 |
| 神煞 | `shensha_get` | 天乙、文昌、桃花等 |
| 合盘 | `profile_pair` | 感情/合作/综合 |
| 黄历 | `almanac_get` `almanac_enhanced` `zeri_select` | 宜忌、建除、择日评分 |
| 典籍 | `classic_search` `knowledge_stats` | 易经/道德/子平/紫微/奇门 |
| 现代 | `science_search` `world_pulse_get` `world_context_refresh` | 科学象意 + RSS 时事 |
| 修行 | `practice_recommend` `practice_start_21day` `practice_check_in` | 21 天径 + 打卡 |
| 案例 | `case_snapshot` | 报告快照 |
| 计费 | `billing_balance` | 积分余额 |

---

## 信息采集（业内最全清单）

### 关键（缺则精度大降）

| 字段 | 作用 | 如何问用户 |
|------|------|------------|
| 出生日期时间（分钟级） | 四柱根基 | 「公历几月几日几点几分出生？」 |
| 出生时辰是否准确 | 时柱权重约 1/4 | 不详则标注 `birth_hour_known: false` |
| 出生地点（省市区） | 真太阳时，经度差 1°≈4 分钟 | 「出生地城市？」 |
| 性别 | 大运顺逆 | 男/女 |

### 推荐（对题释象）

| 字段 | 作用 |
|------|------|
| 现居地 | 流年方位、行事环境 |
| 职业/行业 | 财官印食伤落到具体事业 |
| 问事主题 | 事业/感情/健康/投资/学业 |
| 推演尺度 | day / week / year / lifetime |

### profile_create 示例

```json
{
  "gender": "male",
  "birth_datetime": "1990-05-05T12:00:00+08:00",
  "birth_place": "四川成都",
  "current_location": "北京",
  "occupation": "互联网",
  "quick_input": "199005051200"
}
```

匿名 Agent 场景：可不传 `name`；Web 已移除，一律通过 MCP 档案。

---

## 标准工作流

### A. 首次用户 · 今日运势（轻量）

```
1. profile_list
2. 无档案 → 采集信息 → profile_create
3. daily_fortune_get({ profile_id })   // 免费
4. 转述：summary + branch_relations + almanac + classic + recommendations
```

### B. 深度推演

| 用户意图 | scope | 积分 |
|----------|-------|------|
| 今天/明日 | day | 1 |
| 本周 | week | 2 |
| 今年/流年 | year | 5 |
| 格局/一生 | lifetime | 10 |

```
destiny_infer({ profile_id, scope, question?, question_type?, as_of? })
→ report_get({ report_id })
→ 逐章解读 sections + missing_inputs + recommendations + practice_hint
→ 缺信息 → 建议补全后重新推演
```

报告章节含：命盘根基、五行、刑冲合害、十神、流年/大运、典籍象意、**科学与时势**、**精准提升指引**。

### C. 问事起卦

```
hexagram_cast({ method: "time"|"number", question, numbers? })   // 六爻
meihua_cast({ method: "time"|"number", numbers? })               // 梅花
qimen_chart({ datetime? })                                       // 奇门
liuren_cast({ datetime? })                                       // 大六壬
xiaoliuren_cast({ month?, day?, hour?, question? })              // 小六壬
classic_search({ query: "体用" })
→ 卦象/盘局 + 典籍 + 行动建议
```

### C2. 紫微与交叉印证

```
ziwei_chart({ profile_id }) 或 birth_datetime
bazi_ziwei_cross({ profile_id })
→ lifetime 报告亦含「八字紫微交叉印证」章节
```

### C3. 神煞与择日

```
shensha_get({ profile_id })
almanac_enhanced({ date? })
zeri_select({ start_date, end_date, activity: "marriage"|"travel"|... })
```

### D. 双人合盘

```
profile_create × 2（或 profile_list 选两个）
profile_pair({ profile_id_a, profile_id_b, context: "relationship"|"business"|"general" })
→ 契合度 + 日主关系 + branch_relations + strengths
```

### E. 知命改命 · 21 天修行

```
destiny_infer → practice_start_21day({ profile_id, report_id? })
→ 每日 practice_check_in({ practice_plan_id, duration_minutes, note? })
→ practice_recommend / 月报逻辑见 API
```

### F. 每日订阅

```
push_subscribe({ profile_id, push_hour: 8 })
push_inbox({ profile_id, limit: 7 })
cron: pnpm push:daily
```

---

## 转述模板（不可只给一句话）

```
【{命主} · {尺度}】{summary}
置信度 {confidence}% · 缺项：{missing_inputs}

▎命盘气机
- 日主 / 五行喜忌 / 刑冲合害（sections 要点）

▎{尺度}主题
- 气机详解 / timeline 要点

▎典籍象意
- {classic.title}：一句应用

▎科学与时势（若有）
- science / world_pulse 一句对照，标注「象意参考」

▎行动
- recommendations[0..2]
- practice_hint[0]

▎依据
- sections[].basis 摘 2–3 条

▎免责：文化学习参考，非医疗/法律/投资建议
```

---

## 典籍与知识库

```
classic_search({ query, tradition?, fiction? })
```

| tradition | 内容 |
|-----------|------|
| bagua | 易经八卦 |
| dao | 道德经等 |
| bazi | 子平命理 |
| ziwei | 紫微斗数 |
| qimen | 奇门遁甲 |
| meihua | 梅花易数 |
| tianli | 天理原则 |
| wuxing | 五行生克 |
| neijing | 内经象意 |

```
science_search({ query: "量子" })
world_pulse_get({ limit: 5 })
knowledge_stats()
```

---

## MCP 配置

`~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "cyberdestiny": {
      "command": "node",
      "args": ["/绝对路径/cyberdestiny/packages/mcp/dist/index.js"],
      "env": {
        "CYBERDESTINY_API_URL": "http://localhost:3001",
        "CYBERDESTINY_API_KEY": "cd_dev_local_key"
      }
    }
  }
}
```

本地开发默认 Key：`cd_dev_local_key`（`.env` 中 `DEV_API_KEY`）。

---

## 错误处理

| 错误 | 处理 |
|------|------|
| API 不可达 | 提示 `pnpm dev:api`，检查 `:3001/health` |
| INSUFFICIENT_CREDITS | `billing_balance`，说明 scope 积分 |
| PROFILE_NOT_FOUND | `profile_create` |
| 缺时辰/地点 | 读报告 `missing_inputs`，白话解释影响 |

---

## 禁止事项

- 不代替医疗 / 法律 / 投资唯一依据
- 不让 LLM 手算四柱 — 必须走 MCP
- 不做法事、符箓、恐吓性断言

## 免责声明

推演用于自我反思与文化学习参考，不构成专业建议。
