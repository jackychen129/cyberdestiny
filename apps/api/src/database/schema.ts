import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  real,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum('gender', ['male', 'female', 'unknown']);
export const scopeEnum = pgEnum('inference_scope', ['day', 'week', 'year', 'lifetime']);
export const practicePeriodEnum = pgEnum('practice_period', [
  'daily',
  'weekly',
  'solar_term',
  '21day',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  username: text('username'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  googleId: text('google_id').unique(),
  creditsBalance: integer('credits_balance').notNull().default(100),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  /** 匿名浏览器会话 ID — 每会话仅一条档案，不存姓名 */
  guestSessionId: text('guest_session_id').unique(),
  name: text('name'),
  gender: genderEnum('gender').notNull().default('unknown'),
  birthDatetime: timestamp('birth_datetime', { withTimezone: true }).notNull(),
  birthPlace: text('birth_place'),
  currentLocation: text('current_location'),
  occupation: text('occupation'),
  focusTopics: jsonb('focus_topics').$type<string[]>().default([]),
  notes: text('notes'),
  birthHourKnown: boolean('birth_hour_known').notNull().default(true),
  longitude: real('longitude'),
  latitude: real('latitude'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const inferenceReports = pgTable('inference_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id),
  scope: scopeEnum('scope').notNull(),
  apiVersion: text('api_version').notNull().default('1.0'),
  asOf: timestamp('as_of', { withTimezone: true }).notNull(),
  summary: text('summary').notNull(),
  sections: jsonb('sections').notNull().$type<unknown[]>(),
  timeline: jsonb('timeline').$type<unknown[]>().default([]),
  recommendations: jsonb('recommendations').$type<string[]>().default([]),
  practiceHint: jsonb('practice_hint').$type<string[]>().default([]),
  cautions: jsonb('cautions').$type<string[]>().default([]),
  confidence: real('confidence').notNull(),
  missingInputs: jsonb('missing_inputs').$type<string[]>().default([]),
  attachedArtifacts: jsonb('attached_artifacts').$type<Record<string, unknown>>().default({}),
  practicePlanId: uuid('practice_plan_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const practicePlans = pgTable('practice_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id),
  derivedFromReportId: uuid('derived_from_report_id').references(() => inferenceReports.id),
  period: practicePeriodEnum('period').notNull().default('daily'),
  items: jsonb('items').notNull().$type<unknown[]>().default([]),
  checkIns: jsonb('check_ins').$type<unknown[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const hexagramCasts = pgTable('hexagram_casts', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').references(() => profiles.id),
  method: text('method').notNull(),
  result: jsonb('result').notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const knowledgeEntries = pgTable('knowledge_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // classic | fiction_mapping | glossary
  tradition: text('tradition'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  key: text('key').notNull().unique(),
  label: text('label'),
  creditsBalance: integer('credits_balance').notNull().default(100),
  scopes: jsonb('scopes').$type<string[]>().default(['infer', 'hexagram']),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const caseSnapshots = pgTable('case_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id),
  reportId: uuid('report_id').references(() => inferenceReports.id),
  label: text('label'),
  snapshot: jsonb('snapshot').notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const dailySubscriptions = pgTable('daily_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id),
  enabled: boolean('enabled').notNull().default(true),
  pushHour: integer('push_hour').notNull().default(8),
  timezone: text('timezone').notNull().default('Asia/Shanghai'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const dailyPushLogs = pgTable('daily_push_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').references(() => dailySubscriptions.id),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id),
  pushDate: text('push_date').notNull(),
  reportId: uuid('report_id').references(() => inferenceReports.id),
  payload: jsonb('payload').notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
