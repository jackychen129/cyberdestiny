import { Controller, Get, Param, Header } from '@nestjs/common';
import { InferenceService } from '../inference/inference.service';
import { ExportService } from './export.service';

@Controller('reports')
export class ExportController {
  constructor(
    private readonly inference: InferenceService,
    private readonly exportSvc: ExportService,
  ) {}

  @Get(':id/export/markdown')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="report.md"')
  async exportMarkdown(@Param('id') id: string) {
    const report = await this.inference.getReport(id);
    return this.exportSvc.toMarkdown(report);
  }
}
