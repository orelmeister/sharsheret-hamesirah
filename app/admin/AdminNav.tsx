'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'לוח בקרה',
    icon: '📊',
  },
  {
    href: '/admin/scholars',
    label: 'חכמים',
    icon: '👤',
  },
  {
    href: '/admin/import',
    label: 'ייבוא',
    icon: '📥',
  },
  {
    href: '/admin/login',
    label: 'התנתק',
    icon: '🚪',
    isLogout: true,
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <nav className="flex md:flex-col gap-1 p-3 md:p-4 overflow-x-auto md:overflow-visible">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const baseClasses =
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap';

        if (item.isLogout) {
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={handleLogout}
              className={`${baseClasses} text-red-600 hover:bg-red-50`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${baseClasses} ${
              isActive
                ? 'bg-amber-100 text-amber-800'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
