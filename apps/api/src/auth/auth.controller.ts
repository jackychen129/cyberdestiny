import { Controller, Get, Headers, Query, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('google/status')
  googleStatus() {
    const configured = this.auth.isGoogleConfigured();
    return {
      configured,
      config_error: configured
        ? null
        : '未配置 GOOGLE_CLIENT_ID 或 GOOGLE_CLIENT_SECRET',
      redirect_uri: this.auth.getGoogleRedirectUri(),
      frontend_url: this.auth.getFrontendUrl(),
      hint: 'Google Cloud Console 授权重定向 URI 必须与 redirect_uri 完全一致',
    };
  }

  @Get('google')
  googleLogin(@Res() res: Response) {
    if (!this.auth.isGoogleConfigured()) {
      return res.redirect(
        302,
        `${this.auth.getFrontendUrl()}/login?error=${encodeURIComponent('server_config')}`,
      );
    }
    return res.redirect(302, this.auth.buildGoogleAuthUrl());
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string | undefined, @Res() res: Response) {
    const front = this.auth.getFrontendUrl();
    if (!code) {
      return res.redirect(302, `${front}/login?error=missing_code`);
    }
    try {
      const { token, user } = await this.auth.handleGoogleCallback(code);
      const params = new URLSearchParams({
        from: 'google',
        token,
        username: user.username ?? user.name ?? user.email,
        user_id: user.id,
      });
      return res.redirect(302, `${front}/auth/callback?${params}`);
    } catch {
      return res.redirect(302, `${front}/login?error=oauth_failed`);
    }
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const user = await this.auth.getUserFromToken(token);
    if (!user) throw new UnauthorizedException('未登录');
    return this.auth.getMe(user.id);
  }
}
