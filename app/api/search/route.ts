import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all'; // scholar | source | tag | all
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')));

  if (!q.trim()) {
    return NextResponse.json({ scholars: [], sources: [], tags: [] });
  }

  const results: any = {};

  if (type === 'all' || type === 'scholar') {
    const matches = await prisma.scholar.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { nameHe: { contains: q, mode: 'insensitive' } },
          { alternateNames: { has: q } },
          { biographyShort: { contains: q, mode: 'insensitive' } },
          { memorySummary: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 500,
      select: {
        id: true,
        slug: true,
        nameHe: true,
        period: true,
        role: true,
        imageUrl: true,
        birthStart: true,
        deathEnd: true,
      },
    });
    // Relevance ranking: exact name > bare name (no honorific) > name contains > bio contains
    const bare = (s: string) => s.replace(/^(רבן|רבי|רב|מר)\s+/, '');
    const score = (s: { nameHe: string }) => {
      const n = s.nameHe;
      if (n === q) return 0;
      if (bare(n) === q) return 1;
      if (bare(n).startsWith(q)) return 2;
      if (n.includes(q)) return 3;
      return 4;
    };
    results.scholars = matches.sort((a, b) => score(a) - score(b)).slice(0, limit);
  }

  if (type === 'all' || type === 'source') {
    results.sources = await prisma.source.findMany({
      where: {
        OR: [
          { titleHe: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
          { quoteHe: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        titleHe: true,
        type: true,
        tractate: true,
      },
    });
  }

  if (type === 'all' || type === 'tag') {
    results.tags = await prisma.tag.findMany({
      where: {
        nameHe: { contains: q, mode: 'insensitive' },
      },
      take: limit,
    });
  }

  return NextResponse.json(results);
}
