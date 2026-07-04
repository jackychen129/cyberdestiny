# Agent Skill 安装说明

本仓库为 **Cursor Agent Skill 专用**。完整 Web/API 平台不在 GitHub 公开发布。

## 1. 安装 Skill

```bash
git clone https://github.com/jackychen129/cyberdestiny.git
cd cyberdestiny
node scripts/install-skill.mjs
```

## 2. 配置 MCP

Skill 依赖 CyberDestiny MCP 工具。请确保：

1. API 运行于 `http://localhost:3001`（或修改 `CYBERDESTINY_API_URL`）
2. `~/.cursor/mcp.json` 已配置 `cyberdestiny` server
3. 重启 Cursor

## 3. 验证

在 Agent 对话粘贴 `docs/SKILL_ONE_LINER.md` 中的启用句，Agent 应调用 `profile_list` / `daily_fortune_get` 等工具。

## 免责声明

推演用于自我反思与文化学习参考，不构成医疗、法律或投资建议。
