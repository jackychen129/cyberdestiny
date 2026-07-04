# CyberDestiny · Cursor Agent Skill

赛博天命 Agent Skill — 教 Cursor / OpenClaw **何时调用命理 MCP、如何采集出生信息、如何转述推演报告**。

> 本仓库 **仅含 Skill 文件**。推演引擎与 MCP Server 需自行部署 API（默认 `http://localhost:3001`），Skill 通过 MCP 调用。

## 一句话安装

```bash
git clone https://github.com/jackychen129/cyberdestiny.git cyberdestiny-skill && cd cyberdestiny-skill && node scripts/install-skill.mjs
```

安装到：

- `~/.cursor/skills/cyberdestiny/`
- `~/.cursor/skills/cyberdestiny-infer/`

**重启 Cursor** 后生效。

## 粘贴给 Agent（启用推演）

```
请遵循 ~/.cursor/skills/cyberdestiny/SKILL.md 与 ~/.cursor/skills/cyberdestiny-infer/SKILL.md，使用 CyberDestiny MCP 为我提供八字推演与每日运势；禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 转述详解。
```

## MCP 配置（需已运行 CyberDestiny API）

在 `~/.cursor/mcp.json` 添加（`args` 改为你本机 MCP 入口路径）：

```json
{
  "mcpServers": {
    "cyberdestiny": {
      "command": "node",
      "args": ["/path/to/cyberdestiny/packages/mcp/dist/index.js"],
      "env": {
        "CYBERDESTINY_API_URL": "http://localhost:3001",
        "CYBERDESTINY_API_KEY": "cd_dev_local_key"
      }
    }
  }
}
```

## 仓库结构

| 路径 | 说明 |
|------|------|
| `skills/cyberdestiny/SKILL.md` | 主 Skill：MCP 工具、安装、转述规范 |
| `skills/cyberdestiny-infer/SKILL.md` | 推演专精：档案→推演→日运订阅 |
| `docs/SKILL_ONE_LINER.md` | 一句话复制合集 |

## 许可证

[MIT](LICENSE)
