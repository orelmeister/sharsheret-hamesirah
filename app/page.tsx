import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { PERIODS, PERIOD_ORDER } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const scholarCount = await prisma.scholar.count({ where: { status: 'PUBLISHED' } });
  const relCount = await prisma.relationship.count();
  const periodCounts = await Promise.all(
    PERIOD_ORDER.map(async (key) => ({
      key,
      ...PERIODS[key],
      count: await prisma.scholar.count({ where: { period: key, status: 'PUBLISHED' } }),
    }))
  );

  const quick = [
    { href: '/scholars', icon: '📜', label: 'כל החכמים', desc: 'רשימה מלאה' },
    { href: '/timeline', icon: '⏳', label: 'ציר זמן', desc: 'לאורך הדורות' },
    { href: '/graph', icon: '🕸️', label: 'גרף קשרים', desc: 'רב · תלמיד · חברותא' },
    { href: '/map', icon: '🗺️', label: 'מפה', desc: 'מרכזי התורה' },
  ];

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <section className="text-center pt-14 pb-10 md:pt-20 md:pb-14">
          <p className="text-accent-dark font-semibold tracking-wide mb-3">מאנשי כנסת הגדולה ועד חתימת התלמוד</p>
          <h1 className="font-display font-black text-6xl md:text-8xl text-ink mb-5 leading-[1.05]">
            שרשרת המסירה
          </h1>
          <p className="text-lg md:text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
            מאגר ידע אינטראקטיבי על חכמי המשנה והתלמוד — עקבו אחר מסירת התורה מדור לדור,
            מרב לתלמיד, בגרף, בציר זמן ובמפה.
          </p>

          {/* chain of period pigments */}
          <div className="flex items-center justify-center gap-1.5 mt-6" aria-hidden>
            {PERIOD_ORDER.map((k, i) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PERIODS[k].colorHex }} />
                {i < PERIOD_ORDER.length - 1 && <span className="w-6 h-px bg-line" />}
              </span>
            ))}
          </div>

          {/* Search */}
          <form action="/search" className="mt-9 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="search"
                name="q"
                placeholder="חפש חכם, מקור, תקופה..."
                className="w-full ps-6 pe-28 py-4 text-lg rounded-xl border border-line bg-surface shadow-card
                           focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-right
                           placeholder:text-ink-muted"
              />
              <button
                type="submit"
                className="btn-accent absolute start-2 top-1/2 -translate-y-1/2 px-5 py-2.5"
              >
                חיפוש
              </button>
            </div>
          </form>

          <p className="mt-5 text-sm text-ink-muted">
            <span className="font-semibold text-ink">{scholarCount}</span> חכמים ·
            <span className="font-semibold text-ink"> {relCount}</span> קשרים
          </p>
        </section>

        {/* Periods */}
        <section className="mt-6">
          <h2 className="section-title">תקופות</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {periodCounts.map((p) => (
              <Link
                key={p.key}
                href={`/scholars?period=${p.key}`}
                className="scholar-card group relative overflow-hidden"
              >
                <span className="absolute inset-y-0 end-0 w-1.5" style={{ backgroundColor: p.colorHex }} aria-hidden />
                <div className="flex justify-between items-center gap-3">
                  <span className="font-display text-4xl font-bold" style={{ color: p.colorHex }}>{p.count}</span>
                  <span className="font-display text-xl font-bold text-ink group-hover:text-accent-dark transition-colors">{p.label}</span>
                </div>
                <p className="text-sm text-ink-muted mt-2 text-start">
                  {p.startYear != null && p.endYear != null
                    ? `${p.startYear < 0 ? `${Math.abs(p.startYear)} לפנה״ס` : `${p.startYear} לספירה`} – ${p.endYear < 0 ? `${Math.abs(p.endYear)} לפנה״ס` : `${p.endYear} לספירה`}`
                    : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Explore */}
        <section className="mt-14">
          <h2 className="section-title">חקור</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quick.map((link) => (
              <Link key={link.href} href={link.href} className="scholar-card text-center group">
                <div className="text-3xl mb-2">{link.icon}</div>
                <div className="font-display font-bold text-lg text-ink group-hover:text-accent-dark transition-colors">{link.label}</div>
                <div className="text-sm text-ink-muted mt-1">{link.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-line text-center text-sm text-ink-muted">
          <p>שרשרת המסירה — מיזם קוד פתוח להנגשת תולדות חכמי ישראל</p>
          <p className="mt-1">
            <Link href="/about" className="link-accent underline">אודות ומתודולוגיה</Link>
          </p>
        </footer>
      </main>
    </>
  );
}
