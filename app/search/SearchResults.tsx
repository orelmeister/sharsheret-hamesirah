'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SearchResult {
  scholars: Array<{ id: string; slug: string; nameHe: string; period: string; role: string | null }>;
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
            {results.scholars.map((s) => (
              <Link
                key={s.id}
                href={`/scholars/${s.slug}`}
                className="block scholar-card hover:border-amber-300"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-stone-800">{s.nameHe}</h3>
                  {s.role && <span className="text-sm text-stone-500">{s.role}</span>}
                </div>
              </Link>
            ))}
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
