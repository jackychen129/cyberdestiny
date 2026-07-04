# CyberDestiny 产品需求文档（PRD）

| 字段 | 内容 |
|------|------|
| 产品名称 | CyberDestiny（赛博天命） |
| 版本 | v0.2 |
| 日期 | 2026-06-29 |
| 状态 | 草案（已纳入行业调研） |
| 关联 | [industry-research.md](./industry-research.md) |

---

## 1. 产品概述

### 1.1 一句话定义

CyberDestiny 是一个**面向人与 AI Agent 双通道**的命理推演与修行行动平台，以道家六爻、八卦、风水、五行为核心方法论，结合典籍文献与当代文化语境（如《一人之下》等作品中的命理体系描述），基于个人生辰与上下文信息，输出**日 / 周 / 年 / 一生**四个时间尺度的命数推断，并衔接**知命 → 认命 → 改命**的修行功课闭环。

### 1.2 产品定位

| 维度 | 定位 |
|------|------|
| 对用户 | 专业级、可解释的自我认知与命理推演 Web 应用（弱化「算命」，强化「顺时而为，尽其天性」） |
| 对 Agent | MCP / REST 一等公民的确定性命理推理服务 |
| 方法论 | 道家正统体系为主，辅以典籍与现代叙事中的概念映射 |
| 输出风格 | 严谨、结构化、可追溯；**对话胜于断言**——先释象、再论吉凶、最后给可执行建议 |
| 品牌叙事 | **效率工具 + 生活方式**（参考 FateTell：自我认知工具，非娱乐占卜） |

### 1.3 差异化窗口（相对行业）

基于 [行业调研](./industry-research.md)，CyberDestiny 定位于竞品空白区：

| 能力 | FateTell | 鲲侯/命枢 | askTIAN | **CyberDestiny** |
|------|----------|-----------|---------|------------------|
| 六爻 + 八卦 + 风水深度 | 弱 | 部分 | API 层 | **核心** |
| Agent / MCP 原生 | 弱 | 无 | 强 | **核心** |
| 典籍 + fiction 分层 | 无 | 无 | 无 | **独有** |
| 修行 / 改命闭环 | 叙事 only | 无 | 无 | **核心** |
| 四尺度（日/周/年/一生） | 部分 | 至流时 | 依 endpoint | **统一时间轴** |

### 1.4 核心价值

1. **计算优先**：排盘、卦变、飞星 100% 确定性算法；LLM 只负责释象，杜绝幻觉排盘。
2. **报告优先**：先出结构化完整报告，再基于报告 QA——避免纯对话场景下用户「不知问什么」。
3. **双端统一**：人与 Agent 共用同一推演引擎与知识库，结果一致、可复现。
4. **多时间尺度**：从「明日气运」到「一生格局」，同一档案可纵向对比；Chart Engine 支持至**流时**级。
5. **Agent 原生**：MCP / Skill / REST 同构；支持 API Key 与按量 credits（后期 x402 按次）。
6. **改命行动链**：命理报告自动生成可执行修行功课，落实「知命 → 认命 → 改命」。

---

## 2. 目标用户

### 2.1 人类用户

- 对道家命理、易经、风水有学习兴趣或实践需求的个人。
- 希望获得**结构化、可阅读**推演报告，而非碎片化签文。
- 可能已有八字、六爻等基础认知，期望系统「说得专业、讲得明白」。
- 接受「免费日运摘要 + 付费/积分深度报告」漏斗（国内用户习惯）。

### 2.2 Agent 用户

- 运行在 Cursor、OpenClaw、Claude Desktop 等环境中的**个人 AI Agent**。
- 需要在对话中代用户：录入信息 → 选择推演尺度 → 获取报告 → 解读与行动建议。
- 要求 API 稳定、Schema 清晰、响应可解析为结构化 JSON；无账号 autonomous agent 可后期通过 x402 按次调用。

### 2.3 专业用户（Phase 3+）

- 命理研究者、从业者：需要案例库、合盘、推演快照、eval 导出。
- **非 v1 目标**：大师撮合 marketplace、法事交易。

### 2.4 非目标用户

- 仅寻求一次性娱乐占卜、不需要依据链路的用户（可提供简化日运摘要，非核心）。
- 需要「铁口直断、百分百应验」的绝对预测诉求（产品需明确：**推演为趋势与格局分析，非科学预言**）。

---

## 3. 理论基础与知识来源

### 3.1 核心体系

| 体系 | 用途 | 主要应用场景 |
|------|------|--------------|
| **六爻** | 动爻、世应、六亲、六神，断具体事象与时间 | 日运、周运、具体决策 |
| **八卦** | 象数、卦象、互卦、变卦 | 格局判断、趋势归纳 |
| **五行** | 生克制化、旺相休囚、纳音 | 体质、运势起伏、行业方位、修行功课 |
| **风水** | 峦头理气、九宫飞星、方位吉凶 | 居住/办公环境对运势的调制 |
| **干支历法** | 四柱、节气、大运流年流月流日流时 | 一生格局、年运、月运、日运、时辰 |
| **子午流注** | 时辰气机、养生修行窗 | 修行模块、日运 `practice_hint` |

### 3.2 典籍与文献层（知识库 RAG 来源）

**典籍（优先，可作为断语唯一依据）：**

- 《易经》经传
- 《周易本义》《增删卜易》《卜筮正宗》（六爻）
- 《渊海子平》《三命通会》《滴天髓》（命理）
- 《青囊经》《葬书》《阳宅三要》（风水）
- 道教典籍：天命、因果、修行（《道德经》《南华经》选段）

**现代叙事参考（`fiction_mapping`，仅象意辅助，禁止单独作为断语依据）：**

- 《一人之下》：术法体系、炁、门派命理观、「命运与选择」、性命双修语境
- 其他可映射正统概念的佛道修真/都市异能小说描述（人工 curated，与典籍分库）

### 3.3 推断原则（产品内嵌）

1. **计算优先、有据可依**：Chart Engine 产出确定性盘式；每条 LLM 结论必须关联 `basis`（典籍 / 卦象步骤 / 用户输入）；无引用则降级表述。
2. **象意优先于吉凶标签**：先释象，再谈吉凶；避免单一「好运/坏运」二元输出（对齐顺时 ShunShi「对话胜于断言」）。
3. **时空分层**：同一结论需标明适用时间范围（日/周/年/运/时）。
4. **置信度透明**：缺时辰、缺地点等降精度，写入 `confidence` 与 `missing_inputs`。
5. **fiction 隔离**：`fiction_mapping` 条目不得单独支撑断语；UI 与 Agent 转述时标注「象意参考」。

---

## 4. 功能需求

### 4.1 用户档案（Profile）

用户（人或 Agent 代建）可创建并维护命理档案：

| 字段 | 必填 | 说明 |
|------|------|------|
| 姓名 / 昵称 | 否 | 显示用 |
| 性别 | 建议 | 十神、大运排法 |
| 出生日期时间 | 是 | 精确到分钟；未知时辰则标记并走模糊模式 |
| 出生地点 | 建议 | **真太阳时**校正、方位风水 |
| 现居地 / 常驻地 | 否 | 风水、流年方位 |
| 职业 / 行业 | 否 | 五行喜忌映射 |
| 关注议题 | 否 | 事业、感情、健康、修行等权重 |
| 备注 | 否 | Agent 对话中提取的上下文 |

**能力要求：**

- 支持多档案（家人、客户等）。
- 档案变更时，历史推演报告保留**快照**，可对比「换地/换运」前后差异（案例库 / A-B 复盘）。
- 支持快速输入：`YYYYMMDDHHmm` 数字串、即时排盘（当前时刻）。
- 支持**四柱反查**（由四柱推可能的公历时间窗口）。
- 支持双人**合盘**（`profile_pair`）：婚恋、合作场景（Should，Phase 2）。

### 4.2 推演引擎（Core Engine）

#### 4.2.1 架构原则：计算优先

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Chart Engine（确定性，100% 单测覆盖）               │
│  八字 · 六爻 · 八卦变卦 · 飞星 · 真太阳时 · 流时              │
└───────────────────────────┬─────────────────────────────────┘
                            │ structured artifacts (JSON)
┌───────────────────────────▼─────────────────────────────────┐
│  Layer 2: Rule Engine（五行生克、刑冲合害、用神规则）          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Layer 3: RAG + LLM Interpreter（释象 only，temperature 低）  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Layer 4: Guardrails + Eval Validator（格式、来源、禁则）      │
└─────────────────────────────────────────────────────────────┘
```

**禁止**：让 LLM 直接计算四柱、纳甲、大运起法（通用模型数学弱，行业已验证易错）。

#### 4.2.2 时间尺度

| 尺度 | 代号 | 主要方法 | 典型输出 |
|------|------|----------|----------|
| 一日 | `day` | 日柱、六爻日课、当日卦象、流时 | 当日气机、宜忌、时辰吉凶、`practice_hint` |
| 一周 | `week` | 七日日柱串联、周卦 | 趋势曲线、关键日标记 |
| 一年 | `year` | 流年、太岁、飞星、月令、节气 | 年度主题、季度转折、五行旺衰 |
| 一生 | `lifetime` | 八字格局、大运、用神 | 命格总论、大运时间表、修身建议 |

Chart Engine 内部统一支持 **大运 → 流年 → 流月 → 流日 → 流时** 五级，供各 scope 按需裁剪。

#### 4.2.3 六爻专业流（Must）

| 能力 | 说明 |
|------|------|
| 起卦方式 | 时间卦（默认）、数字卦、手动摇卦（铜钱模拟） |
| 问事类型 | 事业 / 感情 / 健康 / 出行 / 修行 / 自定义 |
| 排盘要素 | 本卦、变卦、世应、六亲、六神、用神旺衰、动爻 |
| Agent 入口 | `hexagram_cast` 独立 tool；亦可在 `destiny_infer` 内嵌 |

**默认策略（已决）**：Agent 未指定时默认**时间卦**；用户显式问事时须采集 `question` + `question_type`。

#### 4.2.4 交互流程：报告优先（Must）

行业验证（FateTell）：纯对话导致用户不知问什么；**报告驱动**留存更好。

```
用户/Agent 发起推演
    → destiny_infer（生成完整报告，异步可轮询）
    → 返回 report_id + summary + deep_link
    → 用户阅读报告（Web）或 Agent 转述摘要
    → 可选：report_qa（基于报告上下文的追问，非全局闲聊）
```

#### 4.2.5 推演 Pipeline

```
输入校验 → 真太阳时校正 → 排盘（八字/卦象/飞星）
    → Rule Engine（五行、刑冲、用神） → RAG 检索（典籍 + fiction 分库）
    → LLM 结构化释象 → Guardrails（禁则、免责声明）
    → Eval 抽检（离线 benchmark） → 报告 + 可选 practice_plan 生成
```

#### 4.2.6 报告结构（JSON + Markdown）

```json
{
  "report_id": "uuid",
  "profile_id": "uuid",
  "scope": "day|week|year|lifetime",
  "api_version": "1.0",
  "as_of": "2026-06-29T08:00:00+08:00",
  "summary": "一段话总论",
  "sections": [
    {
      "title": "格局总览",
      "content": "...",
      "basis": ["bagua_hexagram:乾为天", "classic:滴天髓-xxx"],
      "basis_type": "classic|chart_step|fiction_mapping|user_input"
    }
  ],
  "timeline": [],
  "recommendations": [],
  "practice_hint": [],
  "cautions": [],
  "confidence": 0.85,
  "missing_inputs": [],
  "attached_artifacts": {
    "bazi_chart": {},
    "hexagram": {},
    "fengshui": {}
  },
  "practice_plan_id": "uuid|null"
}
```

#### 4.2.7 离线评测集（Should，Phase 1 起）

- 与真人命理师共建 **evaluation benchmark**（FateTell 验证为垂类 Agent 制胜关键）。
- 每版 Chart Engine / LLM prompt / RAG 变更须跑 regression。
- 目标：相对真人专业师 **7–8 成** 可读准度（公开报道行业 realistic 目标）。

### 4.3 Web 端（Human-facing）

#### 4.3.1 页面清单

| 页面 | 功能 | 优先级 |
|------|------|--------|
| 首页 | 产品介绍、快速开始、示例报告、slogan | Must |
| 档案管理 | CRUD、导入导出、快速输入、合盘 | Must / Should |
| 推演工作台 | 选档案 → 选尺度 → 选议题 → 发起推演 | Must |
| 报告详情 | 总论 / 依据链 / 时间轴 / 建议 / 修行功课 | Must |
| 报告 QA | 基于单份报告的追问面板 | Must |
| 知识库 | 典籍条目、术语百科、卦象词典、五行关系图 | Should |
| 黄历 / 道历 / 择日 | 与 day scope、修行联动 | Should |
| 修行中心 | 每日功课、打卡、21 天径进度 | Phase 2+ |
| 设置 | API Key、订阅、隐私、免责声明 | Must |

#### 4.3.2 交互要求

- 报告页展示**推演依据链**（可折叠）。
- **对比模式**：同一档案不同日期/尺度报告并排；案例快照 A/B。
- 导出 **PDF / Markdown**；Agent **deep link**：`https://{host}/reports/{id}`。
- **免费层**：日运摘要（summary + 1 section）；深度报告消耗积分或 Pro 权益。
- 移动端响应式；排盘表格可横滑。
- **Prompt Export**（过渡期）：无 MCP 时复制结构化命盘至外部 LLM（命枢模式）。

#### 4.3.3 视觉与文案

- 东方玄学 + 现代极简：深色 / 宣纸色主题。
- 五行标准配色；禁止恐吓式文案（血光、必凶等）。
- 对外话术：**自我认知工具**，「顺时而为，尽其天性」。

### 4.4 Agent 集成（Agent-facing）

#### 4.4.1 MCP Server（与 REST 同构）

| Tool | 说明 | 优先级 |
|------|------|--------|
| `profile_create` | 创建命理档案 | Must |
| `profile_get` / `profile_list` | 查询档案 | Must |
| `profile_pair` | 双人合盘 | Should |
| `destiny_infer` | 核心推演：`scope` + `profile_id` + 可选 `question` | Must |
| `report_get` | 按 ID 取报告 | Must |
| `report_qa` | 基于 report_id 的追问 | Must |
| `classic_search` | 检索典籍（不含 fiction 作断语） | Must |
| `hexagram_cast` | 起卦：method + question + question_type | Must |
| `practice_recommend` | 根据 profile + scope/report 生成修行功课 | Phase 2 |
| `almanac_get` | 黄历 / 道历 / 择日 | Should |

**要求：**

- JSON Schema 稳定、版本化（`api_version`）。
- `Accept-Language: zh-CN`（v1）；架构预留 i18n（出海）。
- 语义化错误码：`MISSING_BIRTH_HOUR`、`INVALID_SCOPE`、`INSUFFICIENT_CREDITS` 等。
- 后期预留 **x402 按次付费**（无账号 Agent，参考 xuanxue-bazi-matching）。

#### 4.4.2 Cursor / OpenClaw Skill

- 教 Agent **何时**调用（问运、问卦、问流年、问修行）。
- 规范信息采集（缺时辰 → 说明降精度并建议补全）。
- **转述模板**：摘要 → 关键象意 → 行动建议 → deep link；fiction 引用加「象意参考」。
- 禁止代替医疗 / 法律 / 投资唯一依据；焦虑严重建议专业帮助。

#### 4.4.3 认证与计费

| 方式 | 场景 |
|------|------|
| Personal API Key | 个人 Agent；scoped：read / infer / admin |
| Credits 点数 | 每次 `destiny_infer` / `hexagram_cast` 消耗 N credits |
| 自托管 | 零 credits；本地 Key |
| x402（Could） | Autonomous agent 链上按次 |

Web 与 Agent **共享账户**下的档案、报告、credits 余额。

### 4.5 修行模块（Practitioner Module）

命理回答「天命如何展」；修行回答「当下如何修」。二者合成 **性命双修** 闭环，承接「知命 → 认命 → **改命**」。

#### 4.5.1 产品哲学

| 维度 | 命（推演层） | 性（修行层） |
|------|--------------|--------------|
| 内容 | 五行、卦象、大运 | 专注、心性、习气 |
| 来源 | Chart + Rule + 典籍 | 典籍为主；fiction 仅语境 |
| 输出 | 报告、趋势 | 可执行功课（5–20 分钟级） |

**明确不做（合规）**：符箓、法事、改命交易；内丹具体功法教学（仅文献导读 + 免责）。

#### 4.5.2 Phase A — 与命理强绑定（Phase 2 末交付）

| 功能 | 说明 | 联动 |
|------|------|------|
| 五行功课推荐 | 喜用神 / 当日旺衰 → 色、音、行、息 | `day` → `practice_hint` |
| 子午流注修行窗 | 今日宜静坐 / 动功的 2–3 时辰 | 日柱 + 流时 |
| 节气修行 | 24 节气日推送 | `year` + 黄历 |
| 每日一典 | 《道德》《南华》一句 + 卦象对照 | RAG 典籍 |
| 立愿 / 回向 | 轻量 intention 记录（非强制宗教） | 可选挂接报告 |
| `practice_recommend` | MCP tool → 功课 JSON | Agent 对话 |

#### 4.5.3 Phase B — 习惯与进阶（Phase 3）

- 静坐 / 诵经 / 吐纳 **打卡计时**；日 / 周 / 月 / 年统计。
- **21 天修行径**：知命（读报告）→ 认命（观象）→ 改命（行动）。
- 可选匿名共修（同时段在线人数，无社交压力）。
- 月度修行报告：功课完成度 × 运势自评 × 命盘节点回顾。

#### 4.5.4 数据模型（PracticePlan）

```json
{
  "practice_plan_id": "uuid",
  "profile_id": "uuid",
  "derived_from_report_id": "uuid",
  "period": "daily|weekly|solar_term|21day",
  "items": [
    {
      "type": "meditation|breath|classic_reading|action",
      "title": "辰时静坐 15 分钟",
      "reason_basis": ["wuxing:水旺宜静", "classic:道德经-致虚极"],
      "duration_minutes": 15,
      "optional": false
    }
  ],
  "check_ins": []
}
```

---

## 5. 商业模式

### 5.1 策略：开源核心 + 分层商业

```
Layer 0 — 开源自托管
  Chart Engine + 基础 MCP + 本地 RAG + 日运摘要限额
  目标：隐私用户、开发者、Agent 爱好者

Layer 1 — CyberDestiny Cloud Pro（个人）
  国内 ¥38–68/月 或 出海 $9.99/月
  全尺度推演、year/lifetime、推送、多档案、PDF、优先模型

Layer 2 — Agent API
  Credits 按次（类似 askTIAN TIAN Points）
  MCP + REST 统一计费；后期 x402 无账号按次

Layer 3 — 修行 Plus（可选 bundle）
  Pro 内含 或 +¥19/月
  每日功课、节气修行、AI 修行教练、打卡统计

Layer 4 — Pro Studio（Phase 3+，B2B）
  案例库、合盘、eval 导出、白标
  年费；curated 专家审校（非大师撮合）
```

### 5.2 收入结构目标（参考 FateTell 公开数据）

| 来源 | 目标占比 | 说明 |
|------|----------|------|
| 订阅（Pro + 推送） | **≥ 60%** | 日/周能量提醒、节气、流年节点 |
| 按次深度报告 | 20–30% | 一生/年运深报；国内 ¥19–99，出海 $19–39 |
| Agent API credits | 10–20% | 随 Agent 生态增长 |
| 课程 / 21 天径 | 可选 | Phase 3 |

### 5.3 免费漏斗（国内）

- **免费**：基础排盘 + 日运 `summary` + 1 个 section。
- **积分 / Pro**：完整报告、year/lifetime、合盘、PDF、无限 `report_qa`。
- **不做 v1**：大师佣金 marketplace、开运水晶电商、恐吓式付费墙。

### 5.4 市场策略

| 市场 | 策略 |
|------|------|
| 国内 | 文化 / 自我认知定位；积分制；低价订阅 |
| 出海 | 英文报告；六爻风水 exotic；高价报告 + 订阅（文化溢价） |

---

## 6. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│  Web App (Next.js)        Agent (MCP / Skill / REST)         │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
                ▼                         ▼
┌───────────────────────────────────────────────────────────────┐
│                     API Gateway / BFF                          │
│           REST + MCP（SSE 可选）+ Credits 计量                  │
└───────────────────────────┬───────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┬───────────────┐
        ▼                   ▼                   ▼               ▼
┌──────────────┐   ┌────────────────┐   ┌──────────────┐ ┌─────────────┐
│ Profile Svc  │   │ Inference Svc  │   │ Knowledge Svc│ │ Practice Svc│
│ 档案·合盘    │   │ Chart·Rule·LLM │   │ RAG·典籍     │ │ 功课·打卡   │
└──────────────┘   └────────────────┘   └──────────────┘ └─────────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
          ┌────────────────┐  ┌─────────────┐
          │ Eval Benchmark │  │ PostgreSQL  │
          │ (offline)      │  │ + pgvector  │
          └────────────────┘  └─────────────┘
```

### 6.1 关键模块

| 模块 | 职责 |
|------|------|
| **Chart Engine** | 八字、六爻、八卦、飞星、真太阳时、流时；**纯算法、单测**；后期可选 WASM 客户端 |
| **Rule Engine** | 五行生克、刑冲合害、卦变、用神 |
| **RAG Layer** | 典籍 / glossary / fiction_mapping **分索引** |
| **LLM Interpreter** | 结构化释象；JSON 输出 |
| **Guardrails** | 禁医疗/法律/投资绝对承诺；免责注入 |
| **Eval Benchmark** | 真人师共建测评集；CI regression |
| **Practice Svc** | 功课生成、打卡、21 天径 |
| **Billing** | Credits、订阅、用量统计 |

### 6.2 技术栈（初定）

| 层 | 选型 |
|----|------|
| 前端 | Next.js + React + Tailwind |
| 后端 | Node.js 或 Python（排盘库生态待 Phase 0 spike） |
| 数据库 | PostgreSQL + pgvector |
| MCP | TypeScript `@modelcontextprotocol/sdk` |
| 部署 | 自托管 Docker + Cloud SaaS |

### 6.3 已决 / 待 spike

| 议题 | 决策 |
|------|------|
| 自载 LLM（Ollama） | **Phase 2+** 自托管可选；Cloud 默认托管模型 |
| 六爻默认起卦 | **时间卦**；Agent 可 override |
| 修行扩展 | **纳入产品核心**；Phase A 于 Phase 2 末，见 §4.5 |
| 商业模式 | **开源核心 + Cloud Pro + Agent credits** |

---

## 7. 数据模型（概要）

```
User
  ├── subscription / credits_balance
  └── Profile (1:N)
        ├── InferenceReport (1:N)
        │     ├── ReportSection (1:N)
        │     ├── SourceRef (N:M → KnowledgeEntry)
        │     └── attached_artifacts (BaziChart, Hexagram, Fengshui)
        └── PracticePlan (1:N)
              └── CheckIn (1:N)

KnowledgeEntry
  - type: classic | fiction_mapping | glossary
  - tradition: dao | buddhism | bagua | fengshui | wuxing
  - content, metadata, embedding
  - fiction 条目含 fiction_title, mapped_concept

EvalCase (offline)
  - input_profile, expected_themes, reviewer_notes
```

---

## 8. 非功能需求

| 类别 | 要求 |
|------|------|
| **性能** | `day` P95 < 15s；`lifetime` P95 < 45s（含 LLM） |
| **可用性** | Cloud 核心 API 99.5%；自托管 best-effort |
| **隐私** | 出生信息加密；**自托管零外传**；后期 WASM 本地排盘 |
| **可解释性** | 100% 报告含 `basis`；fiction 标注 `basis_type` |
| **确定性** | 同一输入 + 同一引擎版本 → 盘式结果 bit-identical |
| **合规** | 免责声明；未成年人监护人同意；不做法事交易 |
| **国际化** | v1 中文；Schema 与 UI 预留 i18n |

---

## 9. 免责声明（产品内置）

CyberDestiny 提供的命理推演与修行建议基于传统文化符号体系与算法模型，用于**自我反思、文化学习与娱乐参考**，不构成医疗、法律、财务或心理治疗的专业替代。修行内容仅为一般性身心调节参考，不传授具有风险的功法。用户应理性看待，重大决策请结合现实信息与专业咨询。

---

## 10. 里程碑

### Phase 0 — 基础（4 周）

- [ ] 项目脚手架、CI
- [ ] Chart Engine：八字 + 真太阳时 + 基础六爻 + 单元测试
- [ ] Profile CRUD API；`YYYYMMDDHHmm` 快速输入
- [ ] `destiny_infer` scope=`day`；报告优先闭环
- [ ] MCP：`profile_*`、`destiny_infer`、`report_get`
- [ ] Eval benchmark 骨架（≥20 条种子用例）

### Phase 1 — Web MVP + Agent（4 周）

- [ ] Web：档案、推演工作台、报告详情、report_qa
- [ ] scope=`week`；免费摘要 + 积分/Pro 深报漏斗
- [ ] 知识库 v0：八卦、五行、术语 glossary
- [ ] Skill 文档；deep link；Prompt Export
- [ ] `hexagram_cast` 完整六爻流

### Phase 2 — 年运、一生、风水、修行 A（6 周）

- [ ] scope=`year`、`lifetime`；大运流年至流时
- [ ] 风水（九宫、方位）；罗盘 / 择日 / 黄历
- [ ] RAG 典籍分块；fiction_mapping 种子集
- [ ] 合盘 `profile_pair`；案例快照对比
- [ ] 订阅推送（日运、节气）
- [ ] **修行 Phase A**：`practice_hint`、`practice_recommend`、子午流注、每日一典
- [ ] PDF / Markdown 导出

### Phase 3 — 专业化与修行 B（持续）

- [ ] fiction_mapping curated 扩展；《一人之下》专集
- [ ] 排盘可视化（卦象图、命盘图）
- [ ] 修行 Phase B：打卡、21 天径、月度修行报告
- [ ] Agent credits 计费；Eval benchmark 规模化
- [ ] Pro Studio（案例库、eval 导出）；可选 WASM 客户端排盘
- [ ] Could：x402、Blended Score、白标 SaaS、内经体质

---

## 11. 成功指标（KPI）

| 指标 | 目标（Cloud 上线 3 个月） |
|------|---------------------------|
| 注册档案数 | — |
| Agent 调用占比 | ≥ 30% 推演请求来自 MCP/API |
| 报告完整率（含 basis） | 100% |
| 用户二次推演率 | ≥ 40% |
| 付费转化率 | 参考 3–5%（国内） |
| 订阅占收入比 | ≥ 60% |
| 复购 / 续订率 | ≥ 35% |
| 平均报告阅读时长 | ≥ 2 min |
| 修行功课点击率（Phase 2+） | ≥ 25% 日运用户 |

---

## 12. 风险与对策

| 风险 | 对策 |
|------|------|
| LLM 胡编典籍 | 计算优先 + RAG + basis 校验；无引用降级 |
| LLM 排盘幻觉 | Chart Engine 外挂；禁止 LLM 算四柱 |
| 迷信化误用 | 文案强调自我认知；禁止恐吓付费 |
| fiction 与正统混淆 | 分库分标签；不得单独断语 |
| 出生信息隐私 | 加密、自托管、WASM 排盘（后期） |
| 排盘算法错误 | 与鲲侯/问真等对照测试集 |
| 修行内容安全 | 仅一般调节；不做功法教学；免责 |
| 国内付费弱 | 免费摘要 + 积分；订阅绑定推送价值 |
| 通用 LLM 替代 | 专业深度 + Agent MCP + 依据链 |

---

## 13. 开放问题（剩余）

1. Phase 0 后端语言最终选型（Node vs Python 排盘库生态 spike）。
2. Cloud 默认 LLM 供应商与成本上限。
3. 出海与国内是否拆分为两个品牌 / 域名。
4. Pro Studio 专家审校的合作模式与定价。

---

## 附录 A：术语表

| 术语 | 说明 |
|------|------|
| 六爻 | 纳甲筮法，以六个爻位断事 |
| 八卦 | 乾兑离震巽坎艮坤八象 |
| 五行 | 木火土金水生克循环 |
| 大运 | 十年一运，命理中长期趋势 |
| 流年 / 流时 | 当年 / 当时天干地支对命盘的作用 |
| 用神 | 命局中对平衡最关键的五行或十神 |
| 子午流注 | 十二时辰气血流注，用于养生修行窗 |
| 性命双修 | 性（心性修炼）与命（理气推演）并重 |

---

## 附录 B：Agent 调用示例（MCP）

**用户**：「帮我看看明天运势，我是 1990 年五月初五午时 born 在成都。」

**Agent 流程**：

1. `profile_create` 或匹配已有 profile
2. `destiny_infer({ "profile_id": "...", "scope": "day", "question": "明日整体运势" })`
3. 等待报告 → 解析 `summary` + `recommendations` + `practice_hint`
4. 回复用户摘要，附 `report_get` deep link
5. 若用户追问：「为什么事业一般？」→ `report_qa({ "report_id": "...", "question": "..." })`

---

## 附录 C：竞品能力矩阵（简表）

| 能力 | FateTell | 天机阁 | 鲲侯 | 命枢 | askTIAN | CyberDestiny |
|------|----------|--------|------|------|---------|--------------|
| 八字 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 六爻 | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ 核心 |
| 风水 / 罗盘 | ❌ | ✅ | 择吉 | ✅ | 部分 | ✅ |
| 多尺度运 | 年月日 | 日运 | 至流时 | 大运 | 依 endpoint | 日周年一生 |
| MCP / API | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ 核心 |
| 依据链 | 部分 | ❌ | 知识库 | ❌ | 部分 | ✅ + fiction 分层 |
| 修行 / 打卡 | ❌ | 祈福 | ❌ | 养生 | ❌ | ✅ 核心 |
| 报告优先 | ✅ | 部分 | N/A | N/A | N/A | ✅ |

详见 [industry-research.md](./industry-research.md)。

---

## 附录 D：文档修订记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v0.1 | 2026-06-29 | 初稿 |
| v0.2 | 2026-06-29 | 纳入行业调研：计算优先、报告优先 UX、商业模式四层、修行模块、六爻专业流、Eval benchmark、竞品矩阵；关闭部分开放问题 |

---

*文档结束 — 可进入 Phase 0 技术设计与排盘库 spike。*
