import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { ScholarAvatar } from '@/components/ScholarAvatar';
import { PERIODS, PERIOD_ORDER } from '@/lib/constants';
import { formatYearRange } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ScholarsListPage({
  searchParams,
}: {
  searchParams: { period?: string; page?: string };
}) {
  const period = searchParams.period;
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const limit = 30;

  const where: any = { status: 'PUBLISHED' };
  if (period) where.period = period;

  const [scholars, total] = await Promise.all([
    prisma.scholar.findMany({
      where,
      orderBy: [{ period: 'asc' }, { nameHe: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        nameHe: true,
        period: true,
        role: true,
        birthStart: true,
        deathEnd: true,
        memorySummary: true,
        imageUrl: true,
      },
    }),
    prisma.scholar.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-stone-800 mb-2">כל החכמים</h1>

        {/* Period Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/scholars"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !period ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            הכל ({total})
          </Link>
          {PERIOD_ORDER.map((key) => (
            <Link
              key={key}
              href={`/scholars?period=${key}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === key
                  ? 'bg-stone-800 text-white'
                  : `${PERIODS[key].bgClass} hover:opacity-80`
              }`}
            >
              {PERIODS[key].label}
            </Link>
          ))}
        </div>

        {/* Scholar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scholars.map((s) => {
            const p = PERIODS[s.period as keyof typeof PERIODS];
            return (
              <Link key={s.id} href={`/scholars/${s.slug}`} className="scholar-card group">
                <div className="flex items-start gap-3">
                  <ScholarAvatar nameHe={s.nameHe} period={s.period} imageUrl={s.imageUrl} size={52} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`period-badge text-xs ${p?.bgClass}`}>{p?.label}</span>
                      {s.birthStart && s.deathEnd && (
                        <span className="text-xs text-ink-muted whitespace-nowrap">
                          {formatYearRange(s.birthStart, s.deathEnd)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-xl text-ink mt-1.5 group-hover:text-accent-dark transition-colors leading-tight">
                      {s.nameHe}
                    </h3>
                    {s.role && <p className="text-sm text-ink-muted mt-0.5">{s.role}</p>}
                  </div>
                </div>
                {s.memorySummary && (
                  <p className="text-sm text-ink-muted mt-2 line-clamp-2">{s.memorySummary}</p>
                )}
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/scholars?${period ? `period=${period}&` : ''}page=${p}`}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors ${
                  p === page
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}

        {scholars.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-xl">אין חכמים להצגה</p>
            <p className="mt-2">נסה סינון אחר או חזור מאוחר יותר</p>
          </div>
        )}
      </main>
    </>
  );
}
