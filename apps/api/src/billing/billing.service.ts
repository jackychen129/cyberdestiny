import {
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { apiKeys } from '../database/schema';

@Injectable()
export class BillingService implements OnModuleInit {
  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureDevKey();
  }

  private async ensureDevKey() {
    const devKey = this.config.get<string>('DEV_API_KEY') ?? 'cd_dev_local_key';
    const existing = await this.database.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, devKey))
      .limit(1);
    if (existing.length === 0) {
      await this.database.db.insert(apiKeys).values({
        key: devKey,
        label: 'local-dev',
        creditsBalance: this.getDefaultBalance(),
        scopes: ['infer', 'hexagram', 'admin'],
      });
    }
  }

  getDefaultBalance(): number {
    return parseInt(this.config.get<string>('DEFAULT_CREDITS_BALANCE') ?? '100', 10);
  }

  getInferCost(): Record<string, number> {
    return { day: 1, week: 2, year: 5, lifetime: 10 };
  }

  inferCostForScope(scope: string): number {
    return this.getInferCost()[scope] ?? 1;
  }

  getHexagramCost(): number {
    return parseInt(this.config.get<string>('HEXAGRAM_CREDIT_COST') ?? '1', 10);
  }

  async resolveKey(apiKey?: string) {
    if (!apiKey) {
      return { id: null as string | null, balance: this.getDefaultBalance(), isAnonymous: true };
    }
    const [row] = await this.database.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, apiKey))
      .limit(1);
    if (!row) {
      throw new HttpException({ code: 'INVALID_API_KEY', message: 'API Key 无效' }, HttpStatus.UNAUTHORIZED);
    }
    return { id: row.id, balance: row.creditsBalance, isAnonymous: false };
  }

  async deduct(apiKey: string | undefined, cost: number): Promise<number> {
    if (!apiKey) return this.getDefaultBalance() - cost; // anonymous: no persist

    const [row] = await this.database.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, apiKey))
      .limit(1);
    if (!row) {
      throw new HttpException({ code: 'INVALID_API_KEY', message: 'API Key 无效' }, HttpStatus.UNAUTHORIZED);
    }
    if (row.creditsBalance < cost) {
      throw new HttpException(
        { code: 'INSUFFICIENT_CREDITS', message: '积分不足', required: cost, balance: row.creditsBalance },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    const newBalance = row.creditsBalance - cost;
    await this.database.db
      .update(apiKeys)
      .set({ creditsBalance: newBalance })
      .where(eq(apiKeys.id, row.id));
    return newBalance;
  }

  async getBalance(apiKey: string) {
    const { balance } = await this.resolveKey(apiKey);
    return { credits_balance: balance };
  }
}
