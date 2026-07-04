'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FadeIn } from '@/components/ui/fade-in';

interface AlmanacDay {
  date: string;
  lunar_label: string;
  day_pillar: string;
  year_pillar: string;
  yi: string[];
  ji: string[];
  solar_term?: string;
  dao_festival?: string;
}

export default function AlmanacPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<AlmanacDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<AlmanacDay>(`/almanac/daily?date=${date}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="space-y-8 max-w-xl">
      <PageHeader title="黄历 · 道历" description="择日宜忌、节气与干支气机" />

      <Card className="flex items-center gap-3 py-4">
        <Calendar className="size-5 text-muted shrink-0" />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Card>

      {loading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : data ? (
        <FadeIn>
          <Card className="space-y-5">
            <div>
              <p className="font-serif text-2xl font-medium">{data.lunar_label}</p>
              <p className="text-sm text-muted mt-2">
                日柱 {data.day_pillar} · 年柱 {data.year_pillar}
                {data.solar_term && ` · ${data.solar_term}`}
                {data.dao_festival && ` · ${data.dao_festival}`}
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg bg-wood/8 border border-wood/15 p-4">
                <Badge variant="wood" className="mb-2">宜</Badge>
                <p className="text-sm leading-relaxed">{data.yi.join(' · ')}</p>
              </div>
              <div className="rounded-lg bg-fire/8 border border-fire/15 p-4">
                <Badge variant="fire" className="mb-2">忌</Badge>
                <p className="text-sm leading-relaxed">{data.ji.join(' · ')}</p>
              </div>
            </div>
          </Card>
        </FadeIn>
      ) : null}
    </div>
  );
}
