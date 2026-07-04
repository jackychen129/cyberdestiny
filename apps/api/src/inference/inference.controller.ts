import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import type {
  DestinyInferRequest,
  ReportQaRequest,
  HexagramCastRequest,
} from '@cyberdestiny/shared';
import type { CreditRequest } from '../billing/credits.middleware';
import { InferenceService } from './inference.service';

@Controller()
export class InferenceController {
  constructor(private readonly inferenceService: InferenceService) {}

  @Post('destiny_infer')
  destinyInfer(@Body() body: DestinyInferRequest, @Req() req: CreditRequest) {
    return this.inferenceService.destinyInfer(body, req.apiKey);
  }

  @Get('reports/compare')
  compareReports(@Query('ids') idsParam: string) {
    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    return this.inferenceService.compareReports(ids);
  }

  @Get('reports/:id')
  getReport(@Param('id') id: string) {
    return this.inferenceService.getReport(id);
  }

  @Post('report_qa')
  reportQa(@Body() body: ReportQaRequest) {
    return this.inferenceService.reportQa(body);
  }

  @Post('hexagram_cast')
  hexagramCast(@Body() body: HexagramCastRequest, @Req() req: CreditRequest) {
    return this.inferenceService.hexagramCast(body, req.apiKey);
  }
}
