'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV = [
  { href: '/scholars', label: 'חכמים' },
  { href: '/timeline', label: 'ציר זמן' },
  { href: '/graph', label: 'גרף' },
  { href: '/map', label: 'מפה' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-50 bg-parchment/85 backdrop-blur border-b border-line">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent text-white font-display text-lg leading-none">ש</span>
          <span className="font-display text-xl font-bold text-ink group-hover:text-accent transition-colors">שרשרת המסירה</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive(n.href) ? 'bg-accent-soft text-accent-dark font-semibold' : 'text-ink-soft hover:bg-parchment-dark hover:text-ink'
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/search"
            className={`ms-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              isActive('/search') ? 'bg-accent text-white' : 'bg-accent/10 text-accent-dark hover:bg-accent hover:text-white'
            }`}
          >
            🔍 חיפוש
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="תפריט"
          aria-expanded={open}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-ink hover:bg-parchment-dark transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></> : <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-line bg-parchment">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-3 rounded-lg text-base transition-colors ${
                  isActive(n.href) ? 'bg-accent-soft text-accent-dark font-semibold' : 'text-ink-soft hover:bg-parchment-dark'
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="px-3 py-3 mt-1 rounded-lg text-base font-medium bg-accent text-white text-center"
            >
              🔍 חיפוש
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
