# CyberDestiny Agent 安装与配置指南

面向 Cursor、OpenClaw、Claude Desktop 等 Agent 环境的完整接入说明。

## 前置条件

1. PostgreSQL 已运行，`pnpm db:push` 已完成
2. API 已启动：`pnpm --filter @cyberdestiny/api dev`（默认 `:3001`）
3. （可选）Web 已启动：`pnpm --filter @cyberdestiny/web dev`（`:3000`）

## 一、安装 MCP Server

```bash
cd cyberdestiny
pnpm install
pnpm build
```

构建产物：`packages/mcp/dist/index.js`

## 二、Cursor 配置 MCP

编辑 **用户级** 或 **项目级** MCP 配置：

| 位置 | 路径 |
|------|------|
| Cursor 全局 | `~/.cursor/mcp.json` |
| 项目级 | `.cursor/mcp.json`（仓库根目录） |

```json
{
  "mcpServers": {
    "cyberdestiny": {
      "command": "node",
      "args": ["/绝对路径/cyberdestiny/packages/mcp/dist/index.js"],
      "env": {
        "CYBERDESTINY_API_URL": "http://localhost:3001",
        "CYBERDESTINY_API_KEY": "你的个人 API Key"
      }
    }
  }
}
```

> `CYBERDESTINY_API_KEY`：登录 Web 后在「设置」页复制；本地开发可用 `.env` 中的 `DEV_API_KEY`（默认 `cd_dev_local_key`）。

配置后 **重启 Cursor** 或重载 MCP，在 Agent 对话中应能看到 `cyberdestiny` 工具列表。

## 三、安装 Cursor Skill

Skill 教 Agent **何时调用、如何采集信息、如何转述报告**。

### 方式 A：项目 Skill（推荐，随仓库共享）

仓库已包含：

```
cyberdestiny/skills/cyberdestiny/SKILL.md
```

在 Cursor 中打开本项目即可被 Agent 发现（项目级 skills 目录）。

### 方式 B：个人 Skill（全局可用）

```bash
mkdir -p ~/.cursor/skills/cyberdestiny
cp skills/cyberdestiny/SKILL.md ~/.cursor/skills/cyberdestiny/SKILL.md
```

### 方式 C：OpenClaw 集成

若使用 OpenClaw，将 MCP 配置写入 OpenClaw 的 MCP 段，并确保 `CYBERDESTINY_API_URL` 指向可访问的 API 地址（局域网或公网）。

## 四、用户账户与 API Key

Web 与 Agent **共享同一账户**下的档案、报告与积分。

1. 打开 http://localhost:3000/login
2. 点击 **使用 Google 登录**（需配置 `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`，见 `.env.example`）
3. 登录后进入 **设置**，复制 **Personal API Key**
4. 将 Key 填入 MCP 的 `CYBERDESTINY_API_KEY`

### Google OAuth 配置（与 ClawJob 相同流程）

1. [Google Cloud Console](https://console.cloud.google.com/) → 凭据 → OAuth 2.0 客户端
2. 授权重定向 URI 必须与 `.env` 中 `GOOGLE_REDIRECT_URI` **完全一致**，例如：
   ```
   http://localhost:3001/auth/google/callback
   ```
3. 复制 Client ID / Secret 到 `apps/api/.env` 或根目录 `.env`

## 五、验证安装

```bash
# API 健康
curl http://localhost:3001/health

# Google OAuth 是否配置
curl http://localhost:3001/auth/google/status

# MCP 手动测试（stdio）
CYBERDESTINY_API_URL=http://localhost:3001 \
CYBERDESTINY_API_KEY=cd_dev_local_key \
node packages/mcp/dist/index.js
```

在 Cursor Agent 中尝试：

> 帮我用 CyberDestiny 排一个 1990 年成都出生的日运

Agent 应调用 `profile_create` → `destiny_infer` → 转述 `summary`。

## 六、可用 MCP 工具

| Tool | 说明 |
|------|------|
| `profile_create` / `profile_get` / `profile_list` | 档案 |
| `destiny_infer` | 推演（day/week/year/lifetime） |
| `report_get` / `report_qa` | 报告与追问 |
| `hexagram_cast` | 六爻 |
| `profile_pair` | 合盘 |
| `almanac_get` | 黄历 |
| `classic_search` | 典籍（支持 `tradition` 过滤） |
| `knowledge_stats` | 知识库统计（典籍+科学+时事） |
| `science_search` / `world_pulse_get` | 科学象意 / 时事脉搏 |
| `world_context_refresh` | 刷新 RSS 时事 |
| `practice_recommend` / `practice_check_in` / `practice_start_21day` | 修行 |
| `case_snapshot` | 案例库 |
| `billing_balance` | 积分余额 |
| `daily_fortune_get` | 今日运势（免费） |
| `push_subscribe` / `push_inbox` | 日运订阅与历史 |

## 七、每日运势推送

1. Agent 或 Web 订阅：`push_subscribe({ profile_id, push_hour: 8 })`
2. 立即获取：`daily_fortune_get({ profile_id })` 或 Web `/daily`
3. 定时任务（crontab / GitHub Actions）：

```bash
# 每天 8:00 北京时间（服务器时区自行调整）
0 8 * * * cd /path/cyberdestiny && API_URL=http://localhost:3001 pnpm push:daily
```

`POST /push/run-daily` 为所有订阅档案生成日运并写入 inbox；邮件/Web Push 为后续扩展。

## 八、推演专精 Skill

仓库另含 **`skills/cyberdestiny-infer/SKILL.md`**，覆盖刑冲合害、十神、典籍引用与转述模板。

### 一句话复制（Agent 订阅）

Web **设置** 与 **日运** 页提供「复制」按钮，用户粘贴到 Cursor / OpenClaw 即可让 Agent 按 Skill 订阅或推演。模板定义在 `packages/shared/src/agent-prompts.ts`：

| 函数 | 用途 |
|------|------|
| `buildAgentSkillPrompt()` | 启用 Skill + MCP 推演流程 |
| `buildDailySubscribePrompt(profileId)` | 订阅每日 8 点运势 |
| `buildDailyFortunePrompt(profileId?)` | 立即获取今日运势 |
| `buildAgentFullSetupPrompt(url, key, profileId?)` | 含 API Key 的完整接入 |

示例（订阅日运）：

```
请用 CyberDestiny MCP：对档案 profile_id=xxx 调用 push_subscribe({ push_hour: 8 }) 订阅每日运势，再 daily_fortune_get 展示今日摘要、刑冲合害与行动建议，并遵循 skills/cyberdestiny-infer/SKILL.md 转述。
```

## 九、常见问题

| 现象 | 处理 |
|------|------|
| MCP 工具列表为空 | 检查 `mcp.json` 路径、重启 Cursor、`pnpm --filter @cyberdestiny/mcp build` |
| `INVALID_API_KEY` | 在设置页复制 Key，或设置 `DEV_API_KEY` |
| Google 登录跳转 503 | 未配置 `GOOGLE_CLIENT_ID` |
| redirect_uri_mismatch | Google Console 重定向 URI 与 `GOOGLE_REDIRECT_URI` 不一致 |
| Agent 不算四柱 | 禁止 LLM 手算，必须走 `destiny_infer` |

## 十、科学与时事补充

推演报告含「科学与时势」章节：量子力学、复杂性科学等作**象意补充**（非替代八字计算）；时事来自 BBC/Reuters RSS，每 12 小时自动刷新。

```bash
# 手动刷新时事
pnpm world:refresh
# crontab 示例：每 6 小时
0 */6 * * * cd /path/cyberdestiny && API_URL=http://localhost:3001 pnpm world:refresh
```

## 十一、免责声明

推演结果用于自我反思与文化学习参考，不构成医疗、法律或投资建议。
