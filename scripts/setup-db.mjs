#!/usr/bin/env node
/** 本地 PostgreSQL 初始化：创建 cyberdestiny 用户与数据库 */
import pg from 'pg';

const ADMIN_URL = process.env.ADMIN_DATABASE_URL ?? 'postgresql://jacky@localhost:5432/postgres';
const TARGET_URL = 'postgresql://cyberdestiny:cyberdestiny_dev@localhost:5432/cyberdestiny';

async function main() {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();

  const role = await admin.query("SELECT 1 FROM pg_roles WHERE rolname='cyberdestiny'");
  if (role.rowCount === 0) {
    await admin.query("CREATE USER cyberdestiny WITH PASSWORD 'cyberdestiny_dev'");
    console.log('✓ created user cyberdestiny');
  }

  const db = await admin.query("SELECT 1 FROM pg_database WHERE datname='cyberdestiny'");
  if (db.rowCount === 0) {
    await admin.query('CREATE DATABASE cyberdestiny OWNER cyberdestiny');
    console.log('✓ created database cyberdestiny');
  }

  await admin.end();

  const target = new pg.Client({ connectionString: TARGET_URL });
  await target.connect();
  try {
    await target.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('✓ pgvector extension');
  } catch {
    console.log('⚠ pgvector not available (optional for Phase 2 RAG)');
  }
  await target.end();

  console.log('✓ database ready:', TARGET_URL);
}

main().catch((e) => {
  console.error('setup failed:', e.message);
  process.exit(1);
});
