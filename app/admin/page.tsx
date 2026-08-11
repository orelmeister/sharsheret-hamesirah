import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PERIODS, type PeriodKey } from '@/lib/constants';

interface CountCardProps {
  title: string;
  count: number;
  icon: string;
  color: string;
}

function CountCard({ title, count, icon, color }: CountCardProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-stone-500">{title}</p>
        <p className="text-3xl font-bold text-stone-800">{count}</p>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAuth();

  const [
    totalScholars,
    publishedScholars,
    draftScholars,
    totalSources,
    totalRelationships,
    scholarsByPeriod,
  ] = await Promise.all([
    prisma.scholar.count(),
    prisma.scholar.count({ where: { status: 'PUBLISHED' } }),
    prisma.scholar.count({ where: { status: 'DRAFT' } }),
    prisma.source.count(),
    prisma.relationship.count(),
    prisma.scholar.groupBy({
      by: ['period'],
      _count: { id: true },
      orderBy: { period: 'asc' },
    }),
  ]);

  // Fetch recent activity separately
  const recentActivity = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const totalReviewed = totalScholars - draftScholars;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">לוח בקרה</h1>
        <p className="text-stone-500 mt-1">סקירה כללית של מערכת שרשרת המסירה</p>
      </div>

      {/* Count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CountCard
          title="סך הכול חכמים"
          count={totalScholars}
          icon="👤"
          color="bg-blue-50 text-blue-600"
        />
        <CountCard
          title="פורסמו"
          count={publishedScholars}
          icon="✅"
          color="bg-emerald-50 text-emerald-600"
        />
        <CountCard
          title="טיוטות"
          count={draftScholars}
          icon="📝"
          color="bg-amber-50 text-amber-600"
        />
        <CountCard
          title="מקורות"
          count={totalSources}
          icon="📚"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CountCard
          title="קשרים"
          count={totalRelationships}
          icon="🔗"
          color="bg-rose-50 text-rose-600"
        />
        <CountCard
          title="נסקרו / אושרו"
          count={totalReviewed}
          icon="🔍"
          color="bg-teal-50 text-teal-600"
        />
      </div>

      {/* Breakdown by period */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-4">התפלגות לפי תקופה</h2>
        <div className="space-y-3">
          {scholarsByPeriod.map((group) => {
            const periodKey = group.period as PeriodKey;
            const periodInfo = PERIODS[periodKey];
            return (
              <div key={group.period} className="flex items-center gap-3">
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${periodInfo?.bgClass || 'bg-stone-100 text-stone-600'}`}
                >
                  {periodInfo?.label || group.period}
                </div>
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      periodKey === 'ANSHEI_KNESSET' ? 'bg-emerald-500' :
                      periodKey === 'ZUGOT' ? 'bg-blue-500' :
                      periodKey === 'TANNAIM' ? 'bg-amber-500' :
                      periodKey === 'AMORAIM_ERETZ_YISRAEL' ? 'bg-orange-500' :
                      periodKey === 'AMORAIM_BAVEL' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(100, (group._count.id / Math.max(1, totalScholars)) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-stone-600 w-8 text-left">
                  {group._count.id}
                </span>
              </div>
            );
          })}
          {scholarsByPeriod.length === 0 && (
            <p className="text-stone-400 text-sm">אין נתונים להצגה</p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-4">פעילות אחרונה</h2>
        {recentActivity.length === 0 ? (
          <p className="text-stone-400 text-sm">אין פעילות אחרונה להצגה</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0"
              >
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                  log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                  'bg-stone-100 text-stone-600'
                }`}>
                  {log.action === 'CREATE' ? 'נוצר' :
                   log.action === 'UPDATE' ? 'עודכן' :
                   log.action === 'DELETE' ? 'נמחק' :
                   log.action === 'PUBLISH' ? 'פורסם' :
                   log.action === 'ARCHIVE' ? 'הועבר לארכיון' : log.action}
                </span>
                <span className="text-sm text-stone-600">
                  {log.entity === 'scholar' ? 'חכם' :
                   log.entity === 'source' ? 'מקור' :
                   log.entity === 'relationship' ? 'קשר' : log.entity}
                </span>
                <span className="text-xs text-stone-400 mr-auto">
                  {log.userId?.slice(0, 8) || '—'}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(log.createdAt).toLocaleDateString('he-IL', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
