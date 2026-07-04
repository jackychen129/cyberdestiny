import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  Req,
  Headers,
} from '@nestjs/common';
import type { ProfileCreate, ProfileUpdate, ProfilePairRequest } from '@cyberdestiny/shared';
import { ProfileService } from './profile.service';
import { ProfilePairService } from './profile-pair.service';
import type { AuthedRequest } from '../auth/optional-auth.middleware';

const GUEST_HEADER = 'x-guest-session';

@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly pairService: ProfilePairService,
  ) {}

  @Post('pair')
  pair(@Body() body: ProfilePairRequest) {
    return this.pairService.pair(body);
  }

  @Post()
  create(
    @Body() body: ProfileCreate,
    @Req() req: AuthedRequest,
    @Headers(GUEST_HEADER) guestSession?: string,
  ) {
    return this.profileService.create(body, req.user?.id, guestSession);
  }

  @Get()
  async findAll(@Req() req: AuthedRequest, @Headers(GUEST_HEADER) guestSession?: string) {
    const items = await this.profileService.findAll(req.user?.id, guestSession);
    return { items, total: items.length, guest_mode: !req.user?.id };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: ProfileUpdate,
    @Headers(GUEST_HEADER) guestSession?: string,
  ) {
    return this.profileService.update(id, body, { guestSessionId: guestSession });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Headers(GUEST_HEADER) guestSession?: string) {
    await this.profileService.remove(id, guestSession);
  }
}
