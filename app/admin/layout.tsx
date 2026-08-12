import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import AdminNav from './AdminNav';

export const metadata: Metadata = {
  title: 'ניהול | שרשרת המסירה',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check — redirect to login if no valid session
  const cookieStore = await cookies();
  const token = cookieStore.get('sharsheret_admin_token')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  // Basic validation (the full JWT verify will happen on API calls)
  const parts = token.split('.');
  if (parts.length !== 3) {
    redirect('/admin/login');
  }

  let sessionName = 'מנהל';
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      redirect('/admin/login');
    }
    sessionName = payload.name || payload.username || 'מנהל';
  } catch {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-stone-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-stone-200 flex-shrink-0 hidden md:flex md:flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-stone-200">
          <Link href="/admin" className="block">
            <span className="font-display text-lg text-stone-800">שרשרת המסירה</span>
          </Link>
          <p className="text-xs text-stone-400 mt-0.5">לוח בקרה</p>
        </div>

        {/* Navigation */}
        <AdminNav />

        {/* User info */}
        <div className="mt-auto p-4 border-t border-stone-200">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent-dark font-bold text-xs">
              {sessionName.charAt(0)}
            </div>
            <span className="truncate">{sessionName}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <span className="font-display text-lg text-stone-800">שרשרת המסירה</span>
          <span className="text-sm text-stone-500">{sessionName}</span>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-2">
          <AdminNav />
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
