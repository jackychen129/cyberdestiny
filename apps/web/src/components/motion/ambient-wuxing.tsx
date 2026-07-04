'use client';

const WUXING = [
  { char: '木', color: 'var(--color-wood)', x: '8%', y: '18%', size: '2.5rem', delay: 0 },
  { char: '火', color: 'var(--color-fire)', x: '88%', y: '22%', size: '2rem', delay: -4 },
  { char: '土', color: 'var(--color-earth)', x: '12%', y: '72%', size: '1.75rem', delay: -8 },
  { char: '金', color: 'var(--color-metal)', x: '82%', y: '68%', size: '2.25rem', delay: -12 },
  { char: '水', color: 'var(--color-water)', x: '48%', y: '8%', size: '1.5rem', delay: -6 },
] as const;

export function AmbientWuxing() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {WUXING.map((item) => (
        <span
          key={item.char}
          className="ambient-wuxing-char font-serif select-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
            color: item.color,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.char}
        </span>
      ))}
      <div className="ambient-grid" />
    </div>
  );
}
