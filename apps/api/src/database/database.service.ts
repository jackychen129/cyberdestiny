import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type Database = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool!: Pool;
  public db!: Database;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url =
      this.config.get<string>('DATABASE_URL') ??
      'postgresql://cyberdestiny:cyberdestiny_dev@localhost:5432/cyberdestiny';

    this.pool = new Pool({ connectionString: url });
    this.db = drizzle(this.pool, { schema });

    // Ensure pgvector extension ready (Phase 2 RAG)
    try {
      await this.pool.query('CREATE EXTENSION IF NOT EXISTS vector');
    } catch {
      // extension may already exist or DB not ready in dev
    }
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
}
