import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { BillingService } from './billing.service';
import { AuthService } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';
import { apiKeys } from '../database/schema';

export interface CreditRequest extends Request {
  apiKey?: string;
  creditsBalance?: number;
}

@Injectable()
export class CreditsMiddleware implements NestMiddleware {
  constructor(
    private readonly billing: BillingService,
    private readonly auth: AuthService,
    private readonly database: DatabaseService,
  ) {}

  async use(req: CreditRequest, _res: Response, next: NextFunction) {
    const headerKey = req.headers['x-api-key'];
    const authHeader = req.headers.authorization;
    let apiKey = typeof headerKey === 'string' ? headerKey : undefined;

    if (!apiKey && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const user = await this.auth.getUserFromToken(token);
      if (user) {
        const [row] = await this.database.db
          .select()
          .from(apiKeys)
          .where(eq(apiKeys.userId, user.id))
          .limit(1);
        if (row) apiKey = row.key;
        else apiKey = await this.auth.ensureUserApiKey(user.id);
      } else {
        apiKey = token;
      }
    }

    req.apiKey = apiKey;
    try {
      const { balance } = await this.billing.resolveKey(apiKey);
      req.creditsBalance = balance;
    } catch (e) {
      next(e);
      return;
    }
    next();
  }
}
