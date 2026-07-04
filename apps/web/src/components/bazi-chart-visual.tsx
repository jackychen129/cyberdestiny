'use client';

interface PillarData {
  year_pillar?: string;
  month_pillar?: string;
  day_pillar?: string;
  hour_pillar?: string;
  natal?: { year_pillar?: string; month_pillar?: string; day_pillar?: string; hour_pillar?: string };
  day?: { year_pillar?: string; month_pillar?: string; day_pillar?: string; hour_pillar?: string };
}

export function BaziChartVisual({ data }: { data: Record<string, unknown> }) {
  const chart = data as PillarData;
  const natal = chart.natal ?? chart;
  const day = chart.day;

  const pillars = [
    { label: '年', value: natal.year_pillar },
    { label: '月', value: natal.month_pillar },
    { label: '日', value: natal.day_pillar },
    { label: '时', value: natal.hour_pillar },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 text-center">
        {pillars.map((p) => (
          <div key={p.label} className="rounded-lg border border-ink/15 bg-ink/5 p-3">
            <div className="text-xs text-muted mb-1">{p.label}</div>
            <div className="text-lg font-semibold tracking-widest">{p.value ?? '—'}</div>
          </div>
        ))}
      </div>
      {day && (
        <div>
          <p className="text-xs text-muted mb-2">当日四柱</p>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {['年', '月', '日', '时'].map((label, i) => {
              const vals = [day.year_pillar, day.month_pillar, day.day_pillar, day.hour_pillar];
              return (
                <div key={label} className="rounded border border-water/30 bg-water/5 p-2">
                  <div className="text-xs text-muted">{label}</div>
                  <div className="font-medium">{vals[i] ?? '—'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
