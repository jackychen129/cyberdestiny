#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createApiClient } from './api-client.js';

const API_BASE = process.env.CYBERDESTINY_API_URL ?? 'http://localhost:3001';

async function main() {
  const api = createApiClient(API_BASE);
  const server = new McpServer({
    name: 'cyberdestiny',
    version: '0.1.0',
  });

  server.tool(
    'profile_create',
    '创建命理档案',
    {
      name: z.string().optional().describe('姓名/昵称'),
      gender: z.enum(['male', 'female', 'unknown']).optional(),
      birth_datetime: z.string().describe('ISO 8601 出生时间'),
      birth_place: z.string().optional().describe('出生地点'),
      current_location: z.string().optional(),
      occupation: z.string().optional(),
      focus_topics: z.array(z.string()).optional(),
      notes: z.string().optional(),
      quick_input: z.string().optional().describe('YYYYMMDDHHmm 快速输入'),
    },
    async (args) => {
      const result = await api.post('/profiles', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'profile_get',
    '按 ID 查询命理档案',
    { profile_id: z.string().uuid() },
    async ({ profile_id }) => {
      const result = await api.get(`/profiles/${profile_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'profile_list',
    '列出所有命理档案',
    {},
    async () => {
      const result = await api.get('/profiles');
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'profile_pair',
    '双人八字合盘',
    {
      profile_id_a: z.string().uuid(),
      profile_id_b: z.string().uuid(),
      context: z.enum(['relationship', 'business', 'general']).optional(),
    },
    async (args) => {
      const result = await api.post('/profiles/pair', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'almanac_get',
    '获取黄历/道历日课',
    { date: z.string().optional().describe('YYYY-MM-DD') },
    async ({ date }) => {
      const q = date ? `?date=${date}` : '';
      const result = await api.get(`/almanac/daily${q}`);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'destiny_infer',
    '核心推演：生成完整命理报告',
    {
      profile_id: z.string().uuid(),
      scope: z.enum(['day', 'week', 'year', 'lifetime']),
      question: z.string().optional(),
      question_type: z
        .enum(['career', 'relationship', 'health', 'travel', 'practice', 'custom'])
        .optional(),
      as_of: z.string().optional().describe('推演基准时间 ISO 8601'),
    },
    async (args) => {
      const result = await api.post('/destiny_infer', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'report_get',
    '按 ID 获取推演报告',
    { report_id: z.string().uuid() },
    async ({ report_id }) => {
      const result = await api.get(`/reports/${report_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'hexagram_cast',
    '六爻起卦',
    {
      profile_id: z.string().uuid().optional(),
      method: z.enum(['time', 'number', 'manual']).default('time'),
      question: z.string().optional(),
      question_type: z
        .enum(['career', 'relationship', 'health', 'travel', 'practice', 'custom'])
        .optional(),
      numbers: z.array(z.number()).length(3).optional(),
      as_of: z.string().optional(),
    },
    async (args) => {
      const result = await api.post('/hexagram_cast', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'report_qa',
    '基于报告的追问（Phase 1 skeleton）',
    {
      report_id: z.string().uuid(),
      question: z.string(),
    },
    async (args) => {
      const result = await api.post('/report_qa', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'classic_search',
    '检索典籍、术语、天理原则（支持 tradition 过滤）',
    {
      query: z.string(),
      limit: z.number().optional(),
      tradition: z.string().optional().describe('bagua|dao|bazi|tianli|wuxing|neijing 等'),
      fiction: z.boolean().optional().describe('是否含 fiction 映射'),
    },
    async ({ query, limit, tradition, fiction }) => {
      let url = '/knowledge/classic_search?q=' + encodeURIComponent(query) + '&limit=' + (limit ?? 5);
      if (tradition) url += '&tradition=' + encodeURIComponent(tradition);
      if (fiction) url += '&fiction=1';
      const result = await api.get(url);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'knowledge_stats',
    '查询知识库规模与分类统计',
    {},
    async () => {
      const result = await api.get('/knowledge/stats');
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'world_pulse_get',
    '获取最新时事脉搏与宏观主题（外部变化补充）',
    { limit: z.number().int().optional() },
    async ({ limit }) => {
      const result = await api.get('/knowledge/world-pulse?limit=' + (limit ?? 5));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'science_search',
    '检索现代科学象意（量子、复杂性、系统论等）',
    { query: z.string(), limit: z.number().int().optional() },
    async ({ query, limit }) => {
      const result = await api.get(
        '/knowledge/science_search?q=' + encodeURIComponent(query) + '&limit=' + (limit ?? 5),
      );
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'world_context_refresh',
    '从 RSS 刷新时事脉搏入库',
    {},
    async () => {
      const result = await api.post('/knowledge/refresh-world', {});
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'practice_recommend',
    '生成修行功课（五行、子午流注、每日一典）',
    {
      profile_id: z.string().uuid(),
      scope: z.enum(['day', 'week', 'year', 'lifetime']).optional(),
      report_id: z.string().uuid().optional(),
    },
    async (args) => {
      try {
        const result = await api.post('/practice/recommend', args);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { content: [{ type: 'text', text: JSON.stringify({ code: 'NOT_IMPLEMENTED', message: msg }) }] };
      }
    },
  );

  server.tool(
    'practice_check_in',
    '修行功课打卡',
    {
      practice_plan_id: z.string().uuid(),
      item_index: z.number().int().min(0).optional(),
      duration_minutes: z.number().int().positive().optional(),
      note: z.string().optional(),
    },
    async (args) => {
      const result = await api.post('/practice/check-in', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'practice_start_21day',
    '开启 21 天知命→认命→改命修行径',
    {
      profile_id: z.string().uuid(),
      report_id: z.string().uuid().optional(),
    },
    async (args) => {
      const result = await api.post('/practice/start-21day', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'case_snapshot',
    '将推演报告存入案例库',
    {
      profile_id: z.string().uuid(),
      report_id: z.string().uuid(),
      label: z.string().optional(),
    },
    async (args) => {
      const result = await api.post('/cases/snapshot', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'billing_balance',
    '查询 API Key 积分余额',
    { api_key: z.string().optional().describe('不传则匿名查询') },
    async ({ api_key }) => {
      const headers = api_key ? { 'X-API-Key': api_key } : undefined;
      const result = await api.get('/billing/balance', headers);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'daily_fortune_get',
    '获取今日运势摘要（含黄历、典籍、卦象，不扣积分）',
    {
      profile_id: z.string().uuid(),
      date: z.string().optional().describe('YYYY-MM-DD，默认今日'),
    },
    async ({ profile_id, date }) => {
      const q = date ? '&date=' + date : '';
      const result = await api.get('/push/daily?profile_id=' + profile_id + q);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'push_subscribe',
    '订阅每日运势推送',
    {
      profile_id: z.string().uuid(),
      push_hour: z.number().int().min(0).max(23).optional().describe('推送小时，默认 8'),
    },
    async (args) => {
      const result = await api.post('/push/subscribe', args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'push_inbox',
    '获取历史每日运势收件箱',
    {
      profile_id: z.string().uuid(),
      limit: z.number().int().optional(),
    },
    async ({ profile_id, limit }) => {
      const result = await api.get('/push/inbox?profile_id=' + profile_id + '&limit=' + (limit ?? 7));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CyberDestiny MCP server running on stdio');
}

main().catch((err) => {
  console.error('MCP server failed:', err);
  process.exit(1);
});
