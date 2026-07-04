import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly cases: CasesService) {}

  @Post('snapshot')
  create(
    @Body() body: { profile_id: string; report_id: string; label?: string },
  ) {
    return this.cases.createSnapshot(body.profile_id, body.report_id, body.label);
  }

  @Get()
  list(@Query('profile_id') profileId: string) {
    return this.cases.listByProfile(profileId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.cases.getSnapshot(id);
  }
}
