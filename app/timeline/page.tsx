import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { prisma } from '@/lib/prisma';
import { TimelineView } from './TimelineView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ציר זמן',
  description: 'ציר זמן אינטראקטיבי — מאנשי כנסת הגדולה ועד חתימת התלמוד',
};

interface TimelineScholar {
  id: string;
  slug: string;
  nameHe: string;
  period: string;
  role: string | null;
  birthStart: number | null;
  birthEnd: number | null;
  deathStart: number | null;
  deathEnd: number | null;
  dateConfidence: string;
  generation: { nameHe: string; order: number } | null;
}

interface TimelineEvent {
  id: string;
  titleHe: string;
  dateStart: number | null;
  dateEnd: number | null;
  description: string | null;
  category: string | null;
  place: { nameHe: string } | null;
}

async function getTimelineData() {
  const [scholars, events] = await Promise.all([
    prisma.scholar.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        nameHe: true,
        period: true,
        role: true,
        birthStart: true,
        birthEnd: true,
        deathStart: true,
        deathEnd: true,
        dateConfidence: true,
        generation: {
          select: { nameHe: true, order: true },
        },
      },
      orderBy: [{ birthStart: 'asc' }, { period: 'asc' }],
    }),
    prisma.event.findMany({
      select: {
        id: true,
        titleHe: true,
        dateStart: true,
        dateEnd: true,
        description: true,
        category: true,
        place: {
          select: { nameHe: true },
        },
      },
      orderBy: { dateStart: 'asc' },
    }),
  ]);

  return { scholars, events };
}

export default async function TimelinePage() {
  const { scholars, events } = await getTimelineData();

  return (
    <>
      <Header />
      <main className="flex flex-col h-[calc(100vh-56px)]">
        <div className="shrink-0 px-4 py-3 border-b border-line bg-surface">
          <h1 className="font-display text-2xl font-bold text-ink">ציר זמן</h1>
          <p className="text-sm text-ink-muted">
            מאנשי כנסת הגדולה ועד חתימת התלמוד — {scholars.length} חכמים, {events.length} אירועים היסטוריים
          </p>
        </div>
        <TimelineView scholars={scholars} events={events} />
      </main>
    </>
  );
}
