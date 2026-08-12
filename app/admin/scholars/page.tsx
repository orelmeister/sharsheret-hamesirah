'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PERIODS, type PeriodKey } from '@/lib/constants';

interface ScholarListItem {
  id: string;
  slug: string;
  nameHe: string;
  period: string;
  status: string;
  role: string | null;
  _count: {
    relationshipsFrom: number;
    relationshipsTo: number;
    scholarSources: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'טיוטה',
  REVIEW: 'בסקירה',
  APPROVED: 'מאושר',
  PUBLISHED: 'פורסם',
  ARCHIVED: 'בארכיון',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-stone-100 text-stone-600',
  REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-red-100 text-red-600',
};

export default function AdminScholarsPage() {
  const router = useRouter();
  const [scholars, setScholars] = useState<ScholarListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchScholars = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (search) params.set('q', search);
    if (periodFilter) params.set('period', periodFilter);
    if (statusFilter) params.set('status', statusFilter);

    try {
      const res = await fetch(`/api/admin/scholars?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setScholars(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load scholars:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, periodFilter, statusFilter]);

  useEffect(() => {
    fetchScholars();
  }, [fetchScholars]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/scholars/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'שגיאה במחיקה');
        return;
      }
      setDeleteConfirm(null);
      fetchScholars();
    } catch {
      alert('שגיאה במחיקה');
    } finally {
      setDeleting(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchScholars();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">חכמים</h1>
          <p className="text-stone-500 mt-1">
            {pagination ? `${pagination.total} חכמים במערכת` : 'טוען...'}
          </p>
        </div>
        <Link
          href="/admin/scholars/new"
          className="px-4 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium
                     rounded-lg transition-colors flex items-center gap-2"
        >
          <span>+</span> חכם חדש
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="חיפוש לפי שם..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                       min-w-[200px] text-right"
            dir="auto"
          />
          <select
            value={periodFilter}
            onChange={(e) => { setPeriodFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">כל התקופות</option>
            {Object.entries(PERIODS).map(([key, info]) => (
              <option key={key} value={key}>{info.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">כל הסטטוסים</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700
                       rounded-lg text-sm font-medium transition-colors"
          >
            🔍 חיפוש
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-400">טוען...</div>
        ) : scholars.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            לא נמצאו חכמים
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="text-right px-4 py-3 font-medium">שם</th>
                  <th className="text-right px-4 py-3 font-medium">תפקיד</th>
                  <th className="text-right px-4 py-3 font-medium">תקופה</th>
                  <th className="text-right px-4 py-3 font-medium">סטטוס</th>
                  <th className="text-right px-4 py-3 font-medium">קשרים</th>
                  <th className="text-right px-4 py-3 font-medium">מקורות</th>
                  <th className="text-right px-4 py-3 font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {scholars.map((scholar) => {
                  const periodInfo = PERIODS[scholar.period as PeriodKey];
                  return (
                    <tr
                      key={scholar.id}
                      className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-stone-800">{scholar.nameHe}</span>
                        <br />
                        <span className="text-xs text-stone-400">{scholar.slug}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {scholar.role || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${periodInfo?.bgClass || 'bg-stone-100 text-stone-600'}`}>
                          {periodInfo?.label || scholar.period}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[scholar.status] || 'bg-stone-100 text-stone-600'}`}>
                          {STATUS_LABELS[scholar.status] || scholar.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 text-center">
                        {scholar._count.relationshipsFrom + scholar._count.relationshipsTo}
                      </td>
                      <td className="px-4 py-3 text-stone-600 text-center">
                        {scholar._count.scholarSources}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/scholars/${scholar.id}`}
                            className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200
                                       text-stone-700 transition-colors"
                          >
                            ✏️ עריכה
                          </Link>
                          {deleteConfirm === scholar.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(scholar.id)}
                                disabled={deleting}
                                className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700
                                           text-white transition-colors"
                              >
                                {deleting ? '...' : 'אישור'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs px-2 py-1 rounded bg-stone-100 hover:bg-stone-200
                                           text-stone-600 transition-colors"
                              >
                                ביטול
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(scholar.id)}
                              className="text-xs px-2.5 py-1 rounded bg-red-50 hover:bg-red-100
                                         text-red-600 transition-colors"
                            >
                              🗑️ מחיקה
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-sm
                       hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            הקודם
          </button>
          <span className="text-sm text-stone-600">
            עמוד {page} מתוך {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-sm
                       hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}
