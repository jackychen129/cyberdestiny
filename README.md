# CyberDestiny（赛博天命）

面向人与 AI Agent 双通道的命理推演与修行行动平台。

> 顺时而为，尽其天性

## 技术栈

| 层 | 选型 |
|----|------|
| Monorepo | Turborepo + pnpm |
| 前端 | Next.js 15, React 19, Tailwind CSS 4 |
| 后端 | NestJS 11 |
| 数据库 | PostgreSQL + Drizzle ORM + pgvector |
| Chart Engine | `@cyberdestiny/chart-engine`（纯 TS，Vitest） |
| MCP | `@cyberdestiny/mcp` |
| 共享类型 | `@cyberdestiny/shared`（Zod） |

## 目录结构

```
cyberdestiny/
├── apps/
│   ├── api/          # NestJS REST API
│   └── web/          # Next.js Web App
├── packages/
│   ├── chart-engine/ # 八字、真太阳时、六爻
│   ├── shared/       # Zod schemas
│   └── mcp/          # MCP Server
├── eval/benchmark/   # 离线评测集
├── skills/cyberdestiny/  # Cursor Agent Skill
└── docs/             # PRD、行业调研
```

## 快速开始

### 1. 启动数据库

```bash
docker compose up -d
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境

```bash
cp .env.example .env
```

### 4. 推送数据库 Schema

```bash
pnpm db:push
```

### 5. 构建共享包

```bash
pnpm build
```

### 6. 启动开发服务

```bash
# 终端 1 — API
pnpm --filter @cyberdestiny/api dev

# 终端 2 — Web
pnpm --filter @cyberdestiny/web dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Health: http://localhost:3001/health

### 7. MCP Server

```bash
pnpm --filter @cyberdestiny/mcp build
CYBERDESTINY_API_URL=http://localhost:3001 node packages/mcp/dist/index.js
```

## 测试

```bash
# Chart Engine 单元测试
pnpm --filter @cyberdestiny/chart-engine test

# Eval 种子用例
pnpm --filter @cyberdestiny/eval test
```

## Agent Skill（GitHub 仅 Skill）

[![GitHub](https://img.shields.io/github/stars/jackychen129/cyberdestiny?style=social)](https://github.com/jackychen129/cyberdestiny)

**GitHub 仓库仅发布 Cursor Agent Skill**，不含完整 Web/API 源码。

```bash
git clone https://github.com/jackychen129/cyberdestiny.git cyberdestiny-skill && cd cyberdestiny-skill && node scripts/install-skill.mjs
```

本地完整平台开发：`pnpm skill:publish` 同步 Skill 到 GitHub。

Web 复制入口：http://localhost:3000/agent

## Agent / MCP 接入（本地平台）

详见 **[docs/AGENT_SETUP.md](docs/AGENT_SETUP.md)**。MCP 与 API 在本地 monorepo 运行。

Skill 源文件：`skills/cyberdestiny/` · 推演专精：`skills/cyberdestiny-infer/`

```bash
pnpm skill:install    # 安装到 ~/.cursor/skills/
pnpm skill:publish    # 同步并推送 GitHub Skill 仓库
```

## API 端点

| Method | Path | 说明 |
|--------|------|------|
| POST | `/profiles` | 创建档案 |
| GET | `/profiles` | 列表 |
| GET | `/profiles/:id` | 详情 |
| POST | `/destiny_infer` | 推演 |
| GET | `/reports/:id` | 报告 |
| POST | `/report_qa` | 报告追问 |
| POST | `/hexagram_cast` | 起卦 |
| GET | `/knowledge/classic_search` | 典籍检索 |
| POST | `/practice/recommend` | 修行功课 |
| POST | `/practice/check-in` | 功课打卡 |
| POST | `/practice/start-21day` | 21 天修行径 |
| GET | `/practice/monthly-report/:profileId` | 修行月报 |
| GET | `/billing/balance` | 积分余额 |
| POST | `/cases/snapshot` | 存入案例库 |
| GET | `/cases` | 案例列表 |

## Phase 状态

| 功能 | 状态 |
|------|------|
| 八字四柱 | ✅ 工作 |
| 真太阳时 | ✅ 经度校正 |
| 六爻 | 🔶 skeleton |
| day 推演 | ✅ 端到端 |
| week 推演 | ✅ 七日扫描 + timeline |
| year/lifetime 推演 | ✅ 大运流年 + 九宫飞星 |
| 合盘 profile_pair | ✅ |
| 黄历 / 择日 | ✅ |
| 典籍 RAG | ✅ 种子库 + 检索 + fiction |
| 报告导出 Markdown | ✅ |
| 报告对比 | ✅ |
| 积分计费 API Key | ✅ Phase 3 |
| Google 登录 + 用户账户 | ✅ Phase 4 |
| Agent 安装文档 | ✅ docs/AGENT_SETUP.md |
| 运势详细解释（多章详解） | ✅ day/week/year/lifetime |
| 修行打卡 / 21 天径 / 月报 | ✅ Phase 3 |
| 案例库 | ✅ Phase 3 |
| 命盘/卦象可视化 | ✅ Phase 3 Web |
| Eval benchmark | ✅ chart-engine 实跑 |
| 订阅推送 | ✅ 日运 inbox + cron |
| 规则引擎刑冲合害/十神 | ✅ Phase 4 |
| 周易道家典籍库 | ✅ 270+ 条（含科学/时事） |
| 量子科学与时事 RSS | ✅ 推演补充层 |
| Agent 推演 Skill | ✅ skills/cyberdestiny-infer |

## 许可证

[MIT](LICENSE) — Chart Engine、MCP Server 与 Agent Skill 可自由使用与二次集成。
