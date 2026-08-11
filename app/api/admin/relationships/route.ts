import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/admin-auth';

const createRelationshipSchema = z.object({
  fromScholarId: z.string().uuid('מזהה חכם מקור לא תקין'),
  toScholarId: z.string().uuid('מזהה חכם יעד לא תקין'),
  type: z.enum(['RAV', 'STUDENT', 'CHEVRUTA', 'DISPUTANT', 'CONTEMPORARY', 'FAMILY'], {
    errorMap: () => ({ message: 'סוג קשר לא חוקי' }),
  }),
  confidence: z.enum(['CERTAIN', 'STRONG', 'TRADITIONAL', 'DISPUTED', 'UNKNOWN']).default('TRADITIONAL'),
  sourceId: z.string().uuid('מזהה מקור לא תקין').nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = createRelationshipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check both scholars exist
    const [fromScholar, toScholar] = await Promise.all([
      prisma.scholar.findUnique({ where: { id: parsed.data.fromScholarId }, select: { id: true, nameHe: true } }),
      prisma.scholar.findUnique({ where: { id: parsed.data.toScholarId }, select: { id: true, nameHe: true } }),
    ]);

    if (!fromScholar) {
      return NextResponse.json({ error: 'חכם המקור לא נמצא' }, { status: 404 });
    }
    if (!toScholar) {
      return NextResponse.json({ error: 'חכם היעד לא נמצא' }, { status: 404 });
    }

    // Check for duplicate relationship
    const duplicate = await prisma.relationship.findFirst({
      where: {
        fromScholarId: parsed.data.fromScholarId,
        toScholarId: parsed.data.toScholarId,
        type: parsed.data.type,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: 'קשר זהה כבר קיים במערכת' },
        { status: 409 }
      );
    }

    const relationship = await prisma.relationship.create({
      data: {
        ...parsed.data,
        sourceId: parsed.data.sourceId || null,
      },
      include: {
        fromScholar: { select: { id: true, nameHe: true } },
        toScholar: { select: { id: true, nameHe: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.session.sub,
        action: 'CREATE',
        entity: 'relationship',
        entityId: relationship.id,
        changes: {
          from: fromScholar.nameHe,
          to: toScholar.nameHe,
          type: relationship.type,
        },
      },
    });

    return NextResponse.json({ data: relationship }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/relationships error:', error);
    return NextResponse.json({ error: 'שגיאה ביצירת קשר' }, { status: 500 });
  }
});
