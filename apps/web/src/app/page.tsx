import { Bot, Calculator, FileText } from 'lucide-react';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { HomeHero } from '@/components/home-hero';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { AgentInstallTeaser } from '@/components/agent-install-teaser';

const features = [
  {
    icon: Calculator,
    title: '计算优先',
    desc: '排盘、卦变 100% 确定性算法，LLM 仅负责释象',
  },
  {
    icon: FileText,
    title: '报告优先',
    desc: '先出结构化完整报告，再基于报告追问',
  },
  {
    icon: Bot,
    title: 'Agent 原生',
    desc: 'MCP / REST 同构，人与 Agent 共用同一引擎',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <HomeHero />

      <section className="grid md:grid-cols-3 gap-4 md:gap-6">
        {features.map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 100} direction="scale">
            <Card hover glow tilt className="h-full">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4 transition-transform duration-300 group-hover:scale-110">
                <item.icon className="size-5" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </Card>
          </ScrollReveal>
        ))}
      </section>

      <ScrollReveal delay={80}>
        <AgentInstallTeaser />
      </ScrollReveal>

      <ScrollReveal delay={120}>
        <Card className="text-sm text-muted leading-relaxed">
          <p>
            CyberDestiny 提供的命理推演与修行建议基于传统文化符号体系，用于自我反思与文化学习参考，
            不构成医疗、法律或财务建议。
          </p>
        </Card>
      </ScrollReveal>
    </div>
  );
}
