import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      include: {
        scholarPlaces: {
          include: {
            scholar: {
              select: {
                id: true,
                slug: true,
                nameHe: true,
                period: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Filter to only places that have associated published scholars AND coordinates
    const enriched = places
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => {
        const publishedScholars = p.scholarPlaces.filter(
          (sp) => sp.scholar
        );
        return {
          id: p.id,
          nameHe: p.nameHe,
          nameEn: p.nameEn,
          lat: p.lat,
          lng: p.lng,
          region: p.region,
          scholarCount: publishedScholars.length,
          scholars: publishedScholars.map((sp) => ({
            id: sp.scholar.id,
            slug: sp.scholar.slug,
            nameHe: sp.scholar.nameHe,
            period: sp.scholar.period,
            role: sp.scholar.role,
            notes: sp.notes,
          })),
        };
      })
      .filter((p) => p.scholarCount > 0);

    return NextResponse.json({ places: enriched });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places data' },
      { status: 500 }
    );
  }
}
