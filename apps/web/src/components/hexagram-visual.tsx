'use client';

interface HexLine {
  position: number;
  yin_yang: 'yin' | 'yang';
  moving?: boolean;
}

export function HexagramVisual({
  primary,
  changed,
  lines,
}: {
  primary?: string;
  changed?: string;
  lines?: HexLine[];
}) {
  const displayLines = lines ?? [];

  return (
    <div className="space-y-3">
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted">本卦 </span>
          <span className="font-medium">{primary ?? '—'}</span>
        </div>
        {changed && (
          <div>
            <span className="text-muted">变卦 </span>
            <span className="font-medium">{changed}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col-reverse gap-2 w-24 mx-auto">
        {displayLines.length === 0 ? (
          <p className="text-xs text-muted text-center">无爻象数据</p>
        ) : (
          displayLines.map((line) => (
            <div key={line.position} className="relative h-3 flex items-center justify-center">
              {line.yin_yang === 'yang' ? (
                <div className={`h-1 w-full rounded ${line.moving ? 'bg-fire' : 'bg-ink'}`} />
              ) : (
                <div className="flex gap-1 w-full">
                  <div className={`h-1 flex-1 rounded ${line.moving ? 'bg-fire' : 'bg-ink'}`} />
                  <div className={`h-1 flex-1 rounded ${line.moving ? 'bg-fire' : 'bg-ink'}`} />
                </div>
              )}
              {line.moving && (
                <span className="absolute -right-6 text-xs text-fire">动</span>
              )}
            </div>
          ))
        )}
      </div>
      <p className="text-xs text-muted text-center">上爻在下 · 红色为动爻</p>
    </div>
  );
}
