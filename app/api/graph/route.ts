import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [scholars, relationships] = await Promise.all([
      prisma.scholar.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          slug: true,
          nameHe: true,
          period: true,
          role: true,
          generationId: true,
        },
        orderBy: { period: 'asc' },
      }),
      prisma.relationship.findMany({
        select: {
          id: true,
          fromScholarId: true,
          toScholarId: true,
          type: true,
          confidence: true,
        },
      }),
    ]);

    // Only include relationships where both scholars are published
    const publishedIds = new Set(scholars.map((s) => s.id));
    const filteredRelationships = relationships.filter(
      (r) => publishedIds.has(r.fromScholarId) && publishedIds.has(r.toScholarId)
    );

    const nodes = scholars.map((s) => ({
      id: s.id,
      label: s.nameHe,
      slug: s.slug,
      period: s.period,
      role: s.role,
      generationId: s.generationId,
    }));

    const edges = filteredRelationships.map((r) => ({
      id: r.id,
      source: r.fromScholarId,
      target: r.toScholarId,
      type: r.type,
      confidence: r.confidence,
    }));

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('Graph API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch graph data' },
      { status: 500 }
    );
  }
}
