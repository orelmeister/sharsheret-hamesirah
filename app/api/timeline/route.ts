import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
          generationId: true,
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

    return NextResponse.json({ scholars, events });
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline data' },
      { status: 500 }
    );
  }
}
