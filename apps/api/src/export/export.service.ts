import { Injectable } from '@nestjs/common';
import type { InferenceReport } from '@cyberdestiny/shared';

@Injectable()
export class ExportService {
  toMarkdown(report: InferenceReport): string {
    const lines: string[] = [
      `# CyberDestiny 推演报告`,
      ``,
      `> 尺度：${scopeLabel(report.scope)} | 置信度：${(report.confidence * 100).toFixed(0)}%`,
      `> 基准时间：${report.as_of}`,
      ``,
      `## 总论`,
      ``,
      report.summary,
      ``,
    ];

    for (const section of report.sections) {
      lines.push(`## ${section.title}`, ``, section.content, ``);
      lines.push(`**依据** (${section.basis_type}): ${section.basis.join(' · ')}`, ``);
    }

    if (report.timeline.length > 0) {
      lines.push(`## 时间轴`, ``);
      for (const t of report.timeline) {
        const item = t as { date?: string; label?: string; note?: string };
        lines.push(`- **${item.date ?? ''}** ${item.label ?? ''}${item.note ? ` — ${item.note}` : ''}`);
      }
      lines.push(``);
    }

    if (report.recommendations.length) {
      lines.push(`## 行动建议`, ``);
      report.recommendations.forEach((r) => lines.push(`- ${r}`));
      lines.push(``);
    }

    if (report.practice_hint.length) {
      lines.push(`## 修行提示`, ``);
      report.practice_hint.forEach((h) => lines.push(`- ${h}`));
      lines.push(``);
    }

    lines.push(`---`, `*免责声明：本报告仅供自我认知与文化学习参考。*`);
    return lines.join('\n');
  }
}

function scopeLabel(scope: string): string {
  const map: Record<string, string> = {
    day: '日运', week: '周运', year: '年运', lifetime: '一生格局',
  };
  return map[scope] ?? scope;
}
