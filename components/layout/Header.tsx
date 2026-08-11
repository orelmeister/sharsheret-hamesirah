import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-stone-200">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-stone-800 hover:text-amber-700 transition-colors">
          שרשרת המסירה
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/scholars" className="text-stone-600 hover:text-stone-900 transition-colors">
            חכמים
          </Link>
          <Link href="/timeline" className="text-stone-600 hover:text-stone-900 transition-colors">
            ציר זמן
          </Link>
          <Link href="/graph" className="text-stone-600 hover:text-stone-900 transition-colors">
            גרף
          </Link>
          <Link href="/map" className="text-stone-600 hover:text-stone-900 transition-colors">
            מפה
          </Link>
          <Link
            href="/search"
            className="bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg text-stone-700 transition-colors"
          >
            🔍 חיפוש
          </Link>
        </div>
      </nav>
    </header>
  );
}
