/** Agent / Skill 一句话复制 — Web / Skill / 文档共用 */

export const GITHUB_REPO = 'jackychen129/cyberdestiny';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

export const AGENT_SKILL_PATHS = {
  main: 'skills/cyberdestiny/SKILL.md',
  infer: 'skills/cyberdestiny-infer/SKILL.md',
  cursorMain: '~/.cursor/skills/cyberdestiny/SKILL.md',
  cursorInfer: '~/.cursor/skills/cyberdestiny-infer/SKILL.md',
} as const;

/** 终端一句话：克隆 + 构建 + 安装 Skill */
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

/** 生成 MCP 配置 JSON 字符串 */
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

/** 粘贴给 Cursor Agent：全自动安装 + 首次推演 */
export function buildAgentInstallOneLiner(
  apiUrl = 'http://localhost:3001',
  apiKey = 'cd_dev_local_key',
): string {
  return [
    `请帮我完整安装 CyberDestiny（${GITHUB_REPO_URL}）：`,
    `1) 若未克隆则执行：${buildSkillCloneInstallOneLiner()}；`,
    '2) 启动 API（pnpm --filter @cyberdestiny/api dev）与 Web（pnpm --filter @cyberdestiny/web dev）；',
    `3) 配置 ~/.cursor/mcp.json，MCP 入口为仓库内 packages/mcp/dist/index.js，`,
    `CYBERDESTINY_API_URL=${apiUrl}，CYBERDESTINY_API_KEY=${apiKey}；`,
    `4) 读取 ${AGENT_SKILL_PATHS.cursorMain} 与 ${AGENT_SKILL_PATHS.cursorInfer}；`,
    '5) 采集我的出生时辰、地点、性别后 profile_create，再 daily_fortune_get 并详细转述（禁止手算四柱）。',
  ].join('');
}

/** 启用 Skill + MCP 推演（项目已安装） */
export function buildAgentSkillPrompt(): string {
  return [
    '请遵循',
    AGENT_SKILL_PATHS.cursorMain,
    '与',
    AGENT_SKILL_PATHS.cursorInfer,
    '，使用 CyberDestiny MCP 为我提供八字推演与每日运势；',
    '禁止手算四柱，必须 profile_list → profile_create（若无档案）→ daily_fortune_get 或 destiny_infer，再按 Skill 转述详解。',
  ].join(' ');
}

/** 订阅每日运势推送 */
export function buildDailySubscribePrompt(profileId: string, pushHour = 8): string {
  return [
    '请用 CyberDestiny MCP：',
    `对档案 profile_id=${profileId}`,
    `调用 push_subscribe({ push_hour: ${pushHour} }) 订阅每日运势，`,
    '再 daily_fortune_get 展示今日摘要、刑冲合害与行动建议，',
    `并遵循 ${AGENT_SKILL_PATHS.cursorInfer} 转述。`,
  ].join('');
}

/** 立即获取今日运势 */
export function buildDailyFortunePrompt(profileId?: string): string {
  if (profileId) {
    return [
      '请用 CyberDestiny MCP：',
      `profile_id=${profileId} 调用 daily_fortune_get，`,
      `按 ${AGENT_SKILL_PATHS.cursorInfer} 详细转述（含黄历、典籍、行动建议）。`,
    ].join('');
  }
  return [
    '请用 CyberDestiny MCP：先 profile_list，无档案则 profile_create 采集出生时辰与地点，',
    '再 daily_fortune_get，',
    `按 ${AGENT_SKILL_PATHS.cursorInfer} 详细转述今日运势。`,
  ].join('');
}

/** 登录用户：含 API Key 的完整接入 + 订阅 */
export function buildAgentFullSetupPrompt(apiUrl: string, apiKey: string, profileId?: string): string {
  const sub = profileId
    ? `对 profile_id=${profileId} push_subscribe({ push_hour: 8 })，`
    : 'profile_list 后为我订阅每日 8 点运势，';
  return [
    `请配置 CyberDestiny MCP（CYBERDESTINY_API_URL=${apiUrl}，CYBERDESTINY_API_KEY=${apiKey}），`,
    `读取 ${AGENT_SKILL_PATHS.cursorInfer}，`,
    sub,
    '并 daily_fortune_get 展示今日运势。',
  ].join('');
}
