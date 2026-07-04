/** Agent 一句话复制 — Skill 专用 */

export const GITHUB_REPO = 'jackychen129/cyberdestiny';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;
export const SKILL_PATH = '~/.cursor/skills/cyberdestiny/SKILL.md';

/** 终端：克隆 + 构建 + 安装 Skill + 数据库 */
export function buildSkillCloneInstallOneLiner(cloneDir = 'cyberdestiny'): string {
  return [
    `git clone ${GITHUB_REPO_URL}.git ${cloneDir}`,
    `cd ${cloneDir}`,
    'docker compose up -d',
    'pnpm install',
    'pnpm build',
    'pnpm skill:install',
    'pnpm db:setup',
  ].join(' && ');
}

export function buildMcpConfigJson(
  mcpEntryPath: string,
  apiUrl = 'http://localhost:3001',
  apiKey = 'cd_dev_local_key',
): string {
  return JSON.stringify(
    {
      mcpServers: {
        cyberdestiny: {
          command: 'node',
          args: [mcpEntryPath],
          env: {
            CYBERDESTINY_API_URL: apiUrl,
            CYBERDESTINY_API_KEY: apiKey,
          },
        },
      },
    },
    null,
    2,
  );
}

/** 粘贴 Cursor：全自动安装 + 首次推演 */
export function buildAgentInstallOneLiner(
  apiUrl = 'http://localhost:3001',
  apiKey = 'cd_dev_local_key',
): string {
  return [
    `请帮我安装 CyberDestiny 命理 Skill（${GITHUB_REPO_URL}）：`,
    `1) 执行：${buildSkillCloneInstallOneLiner()}；`,
    `2) 启动 API：pnpm dev:api（${apiUrl}）；`,
    `3) 确认 ~/.cursor/mcp.json 已配置 cyberdestiny MCP，API Key=${apiKey}；`,
    `4) 读取 ${SKILL_PATH}；`,
    '5) 采集出生时辰、地点、性别 → profile_create → daily_fortune_get 详细转述（禁止手算四柱）。',
  ].join('');
}

/** 启用 Skill（已安装） */
export function buildAgentSkillPrompt(): string {
  return [
    `请遵循 ${SKILL_PATH}，使用 CyberDestiny MCP 提供命理推演；`,
    '禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 详细转述。',
  ].join('');
}

export function buildDailySubscribePrompt(profileId: string, pushHour = 8): string {
  return [
    '请用 CyberDestiny MCP：',
    `profile_id=${profileId} 调用 push_subscribe({ push_hour: ${pushHour} })，`,
    '再 daily_fortune_get 展示今日摘要与行动建议，',
    `按 ${SKILL_PATH} 转述。`,
  ].join('');
}

export function buildDailyFortunePrompt(profileId?: string): string {
  if (profileId) {
    return [
      '请用 CyberDestiny MCP：',
      `profile_id=${profileId} daily_fortune_get，`,
      `按 ${SKILL_PATH} 详细转述。`,
    ].join('');
  }
  return [
    '请用 CyberDestiny MCP：profile_list → profile_create → daily_fortune_get，',
    `按 ${SKILL_PATH} 转述。`,
  ].join('');
}

export function buildAgentFullSetupPrompt(apiUrl: string, apiKey: string, profileId?: string): string {
  const sub = profileId
    ? `push_subscribe({ profile_id: "${profileId}", push_hour: 8 })，`
    : 'profile_list 后订阅每日运势，';
  return [
    `配置 CyberDestiny MCP（${apiUrl}，Key=${apiKey}），`,
    `读取 ${SKILL_PATH}，`,
    sub,
    'daily_fortune_get 并转述。',
  ].join('');
}

// 兼容旧导出
export const AGENT_SKILL_PATHS = { main: 'SKILL.md', infer: 'SKILL.md', cursorMain: SKILL_PATH, cursorInfer: SKILL_PATH };
