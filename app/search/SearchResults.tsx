'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScholarAvatar } from '@/components/ScholarAvatar';
import { PERIODS } from '@/lib/constants';
import { formatYearRange } from '@/lib/utils';

interface SearchResult {
  scholars: Array<{ id: string; slug: string; nameHe: string; period: string; role: string | null; imageUrl: string | null; birthStart: number | null; deathEnd: number | null }>;
  sources: Array<{ id: string; titleHe: string; type: string; tractate: string | null }>;
  tags: Array<{ id: string; nameHe: string; slug: string }>;
}

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then(setResults)
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) return <p className="text-stone-400">מחפש...</p>;
  if (!results) return null;

  const isEmpty =
    results.scholars?.length === 0 &&
    results.sources?.length === 0 &&
    results.tags?.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-xl">לא נמצאו תוצאות עבור &ldquo;{query}&rdquo;</p>
        <p className="mt-2">נסה לחפש מונח אחר</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {results.scholars?.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-stone-700 mb-3">חכמים</h2>
          <div className="space-y-2">
            {results.scholars.map((s) => {
              const p = PERIODS[s.period as keyof typeof PERIODS];
              return (
                <Link
                  key={s.id}
                  href={`/scholars/${s.slug}`}
                  className="flex items-center gap-3 scholar-card py-3"
                >
                  <ScholarAvatar nameHe={s.nameHe} period={s.period} imageUrl={s.imageUrl} size={46} rounded="full" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-ink">{s.nameHe}</h3>
                      {p && <span className={`period-badge text-[11px] ${p.bgClass}`}>{p.label}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-muted mt-0.5">
                      {s.role && <span>{s.role}</span>}
                      {s.birthStart != null && s.deathEnd != null && <span>· {formatYearRange(s.birthStart, s.deathEnd)}</span>}
                    </div>
                  </div>
                  <span className="text-ink-muted">←</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {results.sources?.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-stone-700 mb-3">מקורות</h2>
          <div className="space-y-2">
            {results.sources.map((s) => (
              <div key={s.id} className="scholar-card">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-stone-800">{s.titleHe}</h3>
                  {s.tractate && <span className="text-sm text-stone-500">{s.tractate}</span>}
                </div>
                <span className="text-xs text-stone-400">{s.type}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.tags?.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-stone-700 mb-3">תגיות</h2>
          <div className="flex flex-wrap gap-2">
            {results.tags.map((t) => (
              <span key={t.id} className="px-3 py-1 bg-stone-100 rounded-full text-sm text-stone-600">
                {t.nameHe}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
