import { Controller, Get, Post, Query, Param, NotFoundException } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { WorldContextService } from './world-context.service';
import { KNOWLEDGE_TRADITIONS } from './seeds';

@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly knowledge: KnowledgeService,
    private readonly worldContext: WorldContextService,
  ) {}

  @Get('stats')
  stats() {
    return this.knowledge.getStats();
  }

  @Get('traditions')
  traditions() {
    return { traditions: KNOWLEDGE_TRADITIONS };
  }

  @Get('world-pulse')
  worldPulse(@Query('limit') limit?: string) {
    return this.worldContext.getWorldPulse(limit ? parseInt(limit, 10) : 5);
  }

  @Post('refresh-world')
  refreshWorld() {
    return this.worldContext.refreshWorldContext();
  }

  @Get('science_search')
  scienceSearch(@Query('q') q: string, @Query('limit') limit?: string) {
    if (!q) return { items: [], query: '', limit: 0 };
    return this.knowledge.searchScience(q, limit ? parseInt(limit, 10) : 5);
  }

  @Get('entries')
  listEntries(@Query('type') type?: string, @Query('tradition') tradition?: string) {
    if (tradition) return this.knowledge.listByTradition(tradition);
    if (type === 'glossary') return this.knowledge.listGlossary();
    return this.knowledge.listAll(30, true);
  }

  @Get('classic_search')
  classicSearch(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('fiction') fiction?: string,
    @Query('tradition') tradition?: string,
    @Query('principles') principles?: string,
    @Query('modern') modern?: string,
  ) {
    if (!q) return { items: [], query: '', limit: 0 };
    return this.knowledge.classicSearch(
      q,
      limit ? parseInt(limit, 10) : 5,
      fiction === '1',
      tradition,
      principles !== '0',
      modern === '1',
    );
  }

  @Get('glossary/:term')
  async glossary(@Param('term') term: string) {
    const result = await this.knowledge.getGlossary(term);
    if (!result) throw new NotFoundException('术语未找到');
    return { term, definition: result };
  }
}
