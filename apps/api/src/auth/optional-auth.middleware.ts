import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.service';

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

@Injectable()
export class OptionalAuthMiddleware implements NestMiddleware {
  constructor(private readonly auth: AuthService) {}

  async use(req: AuthedRequest, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (token) {
      req.user = (await this.auth.getUserFromToken(token)) ?? undefined;
    }
    next();
  }
}
