'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'שגיאה בהתחברות');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('שגיאת רשת — בדוק את החיבור ונסה שוב');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-stone-800 mb-2">
            שרשרת המסירה
          </h1>
          <p className="text-stone-500 text-sm">ניהול מערכת</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
          <h2 className="text-xl font-bold text-stone-800 mb-6 text-center">
            התחברות למערכת הניהול
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                שם משתמש
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white
                           text-stone-900 placeholder:text-stone-400
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                           transition-colors text-right"
                dir="auto"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                סיסמה
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white
                           text-stone-900 placeholder:text-stone-400
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                           transition-colors text-right"
                dir="auto"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400
                         text-white font-medium rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-stone-400 text-xs mt-6">
          מערכת ניהול תוכן — גישה מורשית בלבד
        </p>
      </div>
    </div>
  );
}
