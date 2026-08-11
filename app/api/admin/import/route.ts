import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/admin-auth';

const importScholarSchema = z.object({
  nameHe: z.string().min(1, 'שם החכם נדרש'),
  slug: z.string().min(1, 'slug נדרש'),
  alternateNames: z.array(z.string()).optional(),
  period: z.enum([
    'ANSHEI_KNESSET', 'ZUGOT', 'TANNAIM',
    'AMORAIM_ERETZ_YISRAEL', 'AMORAIM_BAVEL', 'SAVORAIM',
  ]),
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

const importPayloadSchema = z.object({
  scholars: z.array(importScholarSchema).min(1, 'נדרש לפחות חכם אחד לייבוא'),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = importPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'קובץ JSON לא תקין',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { scholars } = parsed.data;

    // Check for duplicate slugs
    const slugs = scholars.map((s) => s.slug);
    const existing = await prisma.scholar.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map((e) => e.slug));

    const duplicates: string[] = [];
    const toCreate: typeof scholars = [];

    for (const scholar of scholars) {
      if (existingSlugs.has(scholar.slug)) {
        duplicates.push(scholar.slug);
      } else {
        toCreate.push(scholar);
      }
    }

    if (toCreate.length === 0) {
      return NextResponse.json(
        { error: 'כל המזהים (slugs) כבר קיימים במערכת', duplicates },
        { status: 409 }
      );
    }

    // Bulk create
    const created = await prisma.$transaction(
      toCreate.map((s) =>
        prisma.scholar.create({
          data: {
            ...s,
            alternateNames: s.alternateNames || [],
            dateConfidence: s.dateConfidence || 'UNKNOWN',
            status: s.status || 'DRAFT',
          },
        })
      )
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.session.sub,
        action: 'CREATE',
        entity: 'scholar',
        entityId: 'bulk-import',
        changes: {
          count: created.length,
          names: created.map((s) => s.nameHe),
          duplicates: duplicates.length > 0 ? duplicates : undefined,
        },
      },
    });

    return NextResponse.json({
      data: {
        imported: created.length,
        duplicates: duplicates.length,
        duplicateSlugs: duplicates,
        scholars: created.map((s) => ({ id: s.id, slug: s.slug, nameHe: s.nameHe })),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/import error:', error);
    return NextResponse.json({ error: 'שגיאה בייבוא חכמים' }, { status: 500 });
  }
});
