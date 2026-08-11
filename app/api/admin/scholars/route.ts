import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/admin-auth';
import { PERIOD_ORDER } from '@/lib/constants';

// ── GET: List all scholars (including drafts) ──
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    const where: Record<string, unknown> = {};

    if (period) where.period = period;
    if (status) where.status = status;

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
        include: {
          _count: {
            select: {
              relationshipsFrom: true,
              relationshipsTo: true,
              scholarSources: true,
            },
          },
        },
      }),
      prisma.scholar.count({ where }),
    ]);

    return NextResponse.json({
      data: scholars,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/admin/scholars error:', error);
    return NextResponse.json({ error: 'שגיאה בטעינת חכמים' }, { status: 500 });
  }
});

// ── POST: Create scholar ──
const createScholarSchema = z.object({
  nameHe: z.string().min(1, 'שם החכם נדרש'),
  slug: z.string().min(1, 'slug נדרש'),
  alternateNames: z.array(z.string()).default([]),
  period: z.enum([
    'ANSHEI_KNESSET', 'ZUGOT', 'TANNAIM',
    'AMORAIM_ERETZ_YISRAEL', 'AMORAIM_BAVEL', 'SAVORAIM',
  ], { errorMap: () => ({ message: 'תקופה לא חוקית' }) }),
  generationId: z.string().nullable().optional(),
  birthStart: z.number().int().nullable().optional(),
  birthEnd: z.number().int().nullable().optional(),
  deathStart: z.number().int().nullable().optional(),
  deathEnd: z.number().int().nullable().optional(),
  dateConfidence: z.enum(['CERTAIN', 'STRONG', 'TRADITIONAL', 'DISPUTED', 'UNKNOWN']).default('UNKNOWN'),
  biographyShort: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  placeNotes: z.string().nullable().optional(),
  featuredQuote: z.string().nullable().optional(),
  featuredStory: z.string().nullable().optional(),
  memorySummary: z.string().nullable().optional(),
  empireId: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = createScholarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.scholar.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'המזהה (slug) כבר קיים במערכת', details: { slug: ['המזהה כבר בשימוש'] } },
        { status: 409 }
      );
    }

    const scholar = await prisma.scholar.create({
      data: {
        ...parsed.data,
        generationId: parsed.data.generationId || null,
        empireId: parsed.data.empireId || null,
      },
    });

    // Log creation
    await prisma.auditLog.create({
      data: {
        userId: req.session.sub,
        action: 'CREATE',
        entity: 'scholar',
        entityId: scholar.id,
        changes: { nameHe: scholar.nameHe, period: scholar.period, status: scholar.status },
      },
    });

    return NextResponse.json({ data: scholar }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/scholars error:', error);
    return NextResponse.json({ error: 'שגיאה ביצירת חכם' }, { status: 500 });
  }
});
