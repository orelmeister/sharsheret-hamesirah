import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/admin-auth';

// ── GET: Single scholar (full detail) ──
export const GET = withAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const scholar = await prisma.scholar.findUnique({
      where: { id: params.id },
      include: {
        relationshipsFrom: {
          include: {
            toScholar: { select: { id: true, slug: true, nameHe: true, period: true } },
            source: { select: { id: true, titleHe: true } },
          },
        },
        relationshipsTo: {
          include: {
            fromScholar: { select: { id: true, slug: true, nameHe: true, period: true } },
            source: { select: { id: true, titleHe: true } },
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
      return NextResponse.json({ error: 'החכם לא נמצא' }, { status: 404 });
    }

    return NextResponse.json({ data: scholar });
  } catch (error) {
    console.error('GET /api/admin/scholars/[id] error:', error);
    return NextResponse.json({ error: 'שגיאה בטעינת החכם' }, { status: 500 });
  }
});

// ── PUT: Update scholar ──
const updateScholarSchema = z.object({
  nameHe: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  alternateNames: z.array(z.string()).optional(),
  period: z.enum([
    'ANSHEI_KNESSET', 'ZUGOT', 'TANNAIM',
    'AMORAIM_ERETZ_YISRAEL', 'AMORAIM_BAVEL', 'SAVORAIM',
  ]).optional(),
  generationId: z.string().nullable().optional(),
  birthStart: z.number().int().nullable().optional(),
  birthEnd: z.number().int().nullable().optional(),
  deathStart: z.number().int().nullable().optional(),
  deathEnd: z.number().int().nullable().optional(),
  dateConfidence: z.enum(['CERTAIN', 'STRONG', 'TRADITIONAL', 'DISPUTED', 'UNKNOWN']).optional(),
  biographyShort: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  placeNotes: z.string().nullable().optional(),
  featuredQuote: z.string().nullable().optional(),
  featuredStory: z.string().nullable().optional(),
  memorySummary: z.string().nullable().optional(),
  empireId: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const body = await req.json();
    const parsed = updateScholarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check slug uniqueness if changing slug
    if (parsed.data.slug) {
      const existing = await prisma.scholar.findUnique({ where: { slug: parsed.data.slug } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { error: 'המזהה (slug) כבר קיים במערכת' },
          { status: 409 }
        );
      }
    }

    // Fetch old values for audit
    const old = await prisma.scholar.findUnique({
      where: { id: params.id },
      select: { nameHe: true, period: true, status: true },
    });

    if (!old) {
      return NextResponse.json({ error: 'החכם לא נמצא' }, { status: 404 });
    }

    const scholar = await prisma.scholar.update({
      where: { id: params.id },
      data: parsed.data,
    });

    // Log update
    const changes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (key in old && (old as Record<string, unknown>)[key] !== value) {
        changes[key] = { from: (old as Record<string, unknown>)[key], to: value };
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.session.sub,
        action: 'UPDATE',
        entity: 'scholar',
        entityId: scholar.id,
        changes: changes as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ data: scholar });
  } catch (error) {
    console.error('PUT /api/admin/scholars/[id] error:', error);
    return NextResponse.json({ error: 'שגיאה בעדכון החכם' }, { status: 500 });
  }
});

// ── DELETE: Delete scholar ──
export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const existing = await prisma.scholar.findUnique({
      where: { id: params.id },
      select: { id: true, nameHe: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'החכם לא נמצא' }, { status: 404 });
    }

    // Delete all related records first
    await prisma.$transaction([
      prisma.scholarSource.deleteMany({ where: { scholarId: params.id } }),
      prisma.scholarPlace.deleteMany({ where: { scholarId: params.id } }),
      prisma.scholarEvent.deleteMany({ where: { scholarId: params.id } }),
      prisma.scholarTag.deleteMany({ where: { scholarId: params.id } }),
      prisma.scholarRuler.deleteMany({ where: { scholarId: params.id } }),
      prisma.relationship.deleteMany({
        where: { OR: [{ fromScholarId: params.id }, { toScholarId: params.id }] },
      }),
      prisma.scholar.delete({ where: { id: params.id } }),
    ]);

    // Log deletion
    await prisma.auditLog.create({
      data: {
        userId: req.session.sub,
        action: 'DELETE',
        entity: 'scholar',
        entityId: params.id,
        changes: { nameHe: existing.nameHe },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/scholars/[id] error:', error);
    return NextResponse.json({ error: 'שגיאה במחיקת החכם' }, { status: 500 });
  }
});
