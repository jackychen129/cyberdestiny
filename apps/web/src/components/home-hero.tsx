'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MagneticWrap } from '@/components/motion/magnetic-wrap';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

const quickLinks = [
  { href: '/daily', label: '今日运势' },
  { href: '/knowledge', label: '典籍知识库' },
  { href: '/almanac', label: '黄历道历' },
  { href: '/practice', label: '修行中心' },
];

export function HomeHero() {
  return (
    <section className="text-center space-y-8 py-8 md:py-16 relative">
      <div className="motion-hero-glow" aria-hidden />

      <ScrollReveal>
        <p className="text-xs uppercase tracking-[0.2em] text-muted font-medium inline-flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent motion-sparkle" />
          CyberDestiny
        </p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight leading-tight">
          <span className="text-gradient motion-text-shimmer">赛博天命</span>
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={160}>
        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
          顺时而为，尽其天性 — 面向人与 AI Agent 双通道的命理推演平台
        </p>
      </ScrollReveal>

      <ScrollReveal delay={240}>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <MagneticWrap>
            <Link href="/infer">
              <Button size="lg" variant="accent" className="w-full sm:w-auto gap-2 group btn-glow">
                开始推演
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-arrow-nudge" />
              </Button>
            </Link>
          </MagneticWrap>
          <MagneticWrap strength={0.14}>
            <Link href="/profiles">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                管理档案
              </Button>
            </Link>
          </MagneticWrap>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={320}>
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {quickLinks.map((q, i) => (
            <Link
              key={q.href}
              href={q.href}
              className="motion-chip text-sm px-4 py-2 rounded-full border border-border bg-white/50"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {q.label}
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
