import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ScholarRef = {
  id: string;
  slug: string;
  nameHe: string;
  period: string;
};

type SourceRef = {
  id: string;
  titleHe: string;
  pageRef: string | null;
  url: string | null;
} | null;

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const scholar = await prisma.scholar.findUnique({
    where: { slug: params.slug },
    include: {
      relationshipsFrom: {
        include: {
          toScholar: { select: { id: true, slug: true, nameHe: true, period: true } },
          source: { select: { id: true, titleHe: true, pageRef: true, url: true } },
        },
      },
      relationshipsTo: {
        include: {
          fromScholar: { select: { id: true, slug: true, nameHe: true, period: true } },
          source: { select: { id: true, titleHe: true, pageRef: true, url: true } },
        },
      },
      scholarSources: { include: { source: true } },
      scholarPlaces: { include: { place: true } },
      scholarEvents: { include: { event: true } },
      scholarTags: { include: { tag: true } },
      generation: true,
      empire: true,
    },
  });

  if (!scholar) {
    return NextResponse.json({ error: 'Scholar not found' }, { status: 404 });
  }

  const teachers = scholar.relationshipsTo
    .filter((r) => r.type === 'RAV')
    .map((r) => ({ scholar: r.fromScholar, source: r.source, confidence: r.confidence }));

  const students = scholar.relationshipsFrom
    .filter((r) => r.type === 'RAV')
    .map((r) => ({ scholar: r.toScholar, source: r.source, confidence: r.confidence }));

  const chevrutot = [
    ...scholar.relationshipsFrom
      .filter((r) => r.type === 'CHEVRUTA')
      .map((r) => ({ scholar: r.toScholar as ScholarRef, confidence: r.confidence, source: r.source as SourceRef })),
    ...scholar.relationshipsTo
      .filter((r) => r.type === 'CHEVRUTA')
      .map((r) => ({ scholar: r.fromScholar as ScholarRef, confidence: r.confidence, source: r.source as SourceRef })),
  ];

  const disputants = [
    ...scholar.relationshipsFrom
      .filter((r) => r.type === 'DISPUTANT')
      .map((r) => ({ scholar: r.toScholar as ScholarRef, confidence: r.confidence, source: r.source as SourceRef })),
    ...scholar.relationshipsTo
      .filter((r) => r.type === 'DISPUTANT')
      .map((r) => ({ scholar: r.fromScholar as ScholarRef, confidence: r.confidence, source: r.source as SourceRef })),
  ];

  const contemporaries = [
    ...scholar.relationshipsFrom
      .filter((r) => r.type === 'CONTEMPORARY')
      .map((r) => ({ scholar: r.toScholar as ScholarRef, confidence: r.confidence, source: r.source as SourceRef })),
    ...scholar.relationshipsTo
      .filter((r) => r.type === 'CONTEMPORARY')
      .map((r) => ({ scholar: r.fromScholar as ScholarRef, confidence: r.confidence, source: r.source as SourceRef })),
  ];

  return NextResponse.json({
    ...scholar,
    _relations: { teachers, students, chevrutot, disputants, contemporaries },
  });
}
