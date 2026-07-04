import type { Metadata } from 'next';
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/nav';
import { AuthProvider } from '@/components/auth-provider';
import { AmbientWuxing } from '@/components/motion/ambient-wuxing';
import { PageEnter } from '@/components/motion/page-enter';

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-sans',
  display: 'swap',
});

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CyberDestiny · 赛博天命',
  description: '顺时而为，尽其天性 — 专业级命理推演与修行行动平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body className="min-h-screen">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
        </div>
        <AmbientWuxing />
        <AuthProvider>
          <Nav />
          <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 md:py-12">
            <PageEnter>{children}</PageEnter>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
