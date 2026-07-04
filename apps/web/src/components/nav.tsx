'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/', label: '首页' },
  { href: '/profiles', label: '档案' },
  { href: '/daily', label: '日运' },
  { href: '/infer', label: '推演' },
  { href: '/agent', label: 'Agent' },
  { href: '/pair', label: '合盘' },
  { href: '/knowledge', label: '典籍' },
  { href: '/practice', label: '修行' },
  { href: '/almanac', label: '黄历' },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300 border-b',
        scrolled
          ? 'bg-paper/85 backdrop-blur-xl border-border shadow-[0_1px_0_rgba(20,20,19,0.04)]'
          : 'bg-transparent border-transparent',
      )}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 group shrink-0"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-ink text-paper transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Sparkles className="size-4" />
          </span>
          <span className="font-serif font-semibold text-lg tracking-tight">赛博天命</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                  active ? 'text-ink font-medium' : 'text-muted hover:text-ink hover:bg-ink/5',
                )}
              >
                {l.label}
                {active && (
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-accent animate-fade-in" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && (
            user ? (
              <Link
                href="/settings"
                className="hidden sm:inline-flex text-sm px-3 py-1.5 rounded-lg text-water hover:bg-water/8 transition-colors"
              >
                {user.username}
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button size="sm" variant="outline">
                  登录
                </Button>
              </Link>
            )
          )}
          <Link href="/infer" className="hidden sm:block">
            <Button size="sm" variant="accent" className="btn-glow">
              开始推演
            </Button>
          </Link>
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-ink/5 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? '关闭菜单' : '打开菜单'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-out border-t border-border',
          open ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0 border-transparent',
        )}
      >
        <nav className="px-4 py-3 grid grid-cols-2 gap-1 bg-paper/95 backdrop-blur-xl nav-mobile-enter">
          {links.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-sm transition-colors',
                  active ? 'bg-ink text-paper font-medium' : 'text-ink-soft hover:bg-ink/5',
                )}
              >
                {l.label}
              </Link>
            );
          })}
          {!loading && !user && (
            <Link href="/login" className="col-span-2 mt-1">
              <Button className="w-full" variant="outline" size="sm">
                登录账户
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
