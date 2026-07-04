import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { users, apiKeys } from '../database/schema';
import { signJwt, verifyJwt } from './jwt.util';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  creditsBalance: number;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private jwtSecret!: string;

  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.jwtSecret =
      this.config.get<string>('JWT_SECRET') ?? 'cyberdestiny-dev-jwt-change-in-production';
  }

  isGoogleConfigured(): boolean {
    return !!(
      this.config.get<string>('GOOGLE_CLIENT_ID') &&
      this.config.get<string>('GOOGLE_CLIENT_SECRET')
    );
  }

  getGoogleRedirectUri(): string {
    return (
      this.config.get<string>('GOOGLE_REDIRECT_URI') ??
      'http://localhost:3001/auth/google/callback'
    );
  }

  getFrontendUrl(): string {
    return (this.config.get<string>('WEB_URL') ?? 'http://localhost:3000').replace(/\/$/, '');
  }

  buildGoogleAuthUrl(): string {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.getGoogleRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async handleGoogleCallback(code: string): Promise<{ token: string; user: AuthUser }> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) throw new Error('Google OAuth not configured');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.getGoogleRedirectUri(),
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new Error('token_exchange_failed');
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) throw new Error('no_access_token');

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!profileRes.ok) throw new Error('userinfo_failed');
    const profile = (await profileRes.json()) as {
      id?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    if (!profile.email) throw new Error('no_email');

    const user = await this.findOrCreateGoogleUser(profile);
    const jwt = signJwt(
      { sub: user.id, email: user.email, name: user.name },
      this.jwtSecret,
    );
    return { token: jwt, user };
  }

  private async findOrCreateGoogleUser(profile: {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
  }): Promise<AuthUser> {
    const email = profile.email!;
    let [row] = await this.database.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!row && profile.id) {
      [row] = await this.database.db
        .select()
        .from(users)
        .where(eq(users.googleId, profile.id))
        .limit(1);
    }

    if (!row) {
      const baseUsername = (profile.name ?? email.split('@')[0] ?? 'user').replace(/\s+/g, '_').slice(0, 30);
      const [created] = await this.database.db
        .insert(users)
        .values({
          email,
          googleId: profile.id,
          name: profile.name,
          username: baseUsername,
          avatarUrl: profile.picture,
          creditsBalance: this.config.get<number>('DEFAULT_CREDITS_BALANCE') ?? 100,
        })
        .returning();
      row = created;
      if (!row) throw new Error('Failed to create user');
      await this.ensureUserApiKey(row.id);
    } else if (profile.picture && profile.picture !== row.avatarUrl) {
      await this.database.db
        .update(users)
        .set({ avatarUrl: profile.picture, name: profile.name ?? row.name })
        .where(eq(users.id, row.id));
    }

    return this.toAuthUser(row);
  }

  async ensureUserApiKey(userId: string): Promise<string> {
    const existing = await this.database.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .limit(1);
    if (existing[0]) return existing[0].key;

    const key = `cd_${randomBytes(24).toString('hex')}`;
    const [user] = await this.database.db.select().from(users).where(eq(users.id, userId)).limit(1);
    await this.database.db.insert(apiKeys).values({
      key,
      label: 'personal',
      userId,
      creditsBalance: user?.creditsBalance ?? 100,
      scopes: ['infer', 'hexagram', 'admin'],
    });
    return key;
  }

  async getUserFromToken(token?: string): Promise<AuthUser | null> {
    if (!token) return null;
    const payload = verifyJwt(token, this.jwtSecret);
    if (!payload) return null;
    const [row] = await this.database.db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!row) return null;
    return this.toAuthUser(row);
  }

  async getMe(userId: string) {
    const user = await this.getUserById(userId);
    const keys = await this.database.db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).limit(1);
    let apiKey = keys[0]?.key;
    if (!apiKey) apiKey = await this.ensureUserApiKey(userId);
    return {
      user,
      api_key: apiKey,
      api_key_masked: `${apiKey.slice(0, 8)}…${apiKey.slice(-4)}`,
      credits_balance: user.creditsBalance,
    };
  }

  async getUserById(id: string): Promise<AuthUser> {
    const [row] = await this.database.db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!row) throw new UnauthorizedException('用户不存在');
    return this.toAuthUser(row);
  }

  private toAuthUser(row: typeof users.$inferSelect): AuthUser {
    return {
      id: row.id,
      email: row.email ?? '',
      name: row.name ?? undefined,
      username: row.username ?? undefined,
      avatarUrl: row.avatarUrl ?? undefined,
      creditsBalance: row.creditsBalance,
    };
  }
}
