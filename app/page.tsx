import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { PERIODS, PERIOD_ORDER } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const scholarCount = await prisma.scholar.count({ where: { status: 'PUBLISHED' } });
  const periodCounts = await Promise.all(
    PERIOD_ORDER.map(async (key) => ({
      key,
      ...PERIODS[key],
      count: await prisma.scholar.count({ where: { period: key, status: 'PUBLISHED' } }),
    }))
  );

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <section className="text-center py-16 md:py-24">
          <h1 className="font-display text-5xl md:text-7xl text-stone-800 mb-4">
            שרשרת המסירה
          </h1>
          <p className="text-xl md:text-2xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
            מאגר ידע אינטראקטיבי על חכמי המשנה והתלמוד —
            <br />
            מאנשי כנסת הגדולה ועד חתימת התלמוד
          </p>

          {/* Search */}
          <form action="/search" className="mt-10 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="search"
                name="q"
                placeholder="חפש חכם, מקור, תקופה..."
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-stone-200 
                           focus:border-amber-400 focus:outline-none text-right
                           placeholder:text-stone-400"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600
                           text-white px-6 py-2 rounded-lg transition-colors"
              >
                🔍
              </button>
            </div>
          </form>
        </section>

        {/* Periods Grid */}
        <section className="mt-12">
          <h2 className="section-title">תקופות</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {periodCounts.map((p) => (
              <Link
                key={p.key}
                href={`/scholars?period=${p.key}`}
                className={`scholar-card border-r-4 ${p.borderClass} group`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{p.count}</span>
                  <span className={`period-badge ${p.bgClass}`}>{p.label}</span>
                </div>
                <p className="text-sm text-stone-500 mt-2">
                  {p.startYear && p.endYear
                    ? `${Math.abs(p.startYear)} לפנה״ס – ${p.endYear} לספירה`
                    : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-16">
          <h2 className="section-title">חקור</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { href: '/scholars', label: '📜 כל החכמים', desc: 'רשימה מלאה' },
              { href: '/timeline', label: '⏳ ציר זמן', desc: 'לאורך הדורות' },
              { href: '/graph', label: '🕸️ גרף קשרים', desc: 'רב-תלמיד-חברותא' },
              { href: '/map', label: '🗺️ מפה', desc: 'מקומות פעילות' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="scholar-card text-center group hover:border-amber-300"
              >
                <div className="text-3xl mb-2">{link.label.split(' ')[0]}</div>
                <div className="font-medium text-stone-700">{link.label.slice(2)}</div>
                <div className="text-sm text-stone-400 mt-1">{link.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-stone-200 text-center text-sm text-stone-400">
          <p>שרשרת המסירה — מיזם קוד פתוח להנגשת תולדות חכמי ישראל</p>
          <p className="mt-1">
            <Link href="/about" className="hover:text-stone-600 underline">
              אודות ומתודולוגיה
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
