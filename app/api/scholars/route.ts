import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const period = searchParams.get('period');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

  const where: any = { status: 'PUBLISHED' };

  if (period) {
    where.period = period;
  }

  if (q) {
    where.OR = [
      { nameHe: { contains: q, mode: 'insensitive' } },
      { alternateNames: { has: q } },
      { biographyShort: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [scholars, total] = await Promise.all([
    prisma.scholar.findMany({
      where,
      orderBy: [{ period: 'asc' }, { nameHe: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        nameHe: true,
        period: true,
        role: true,
        birthStart: true,
        deathEnd: true,
        memorySummary: true,
      },
    }),
    prisma.scholar.count({ where }),
  ]);

  return NextResponse.json({
    data: scholars,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
