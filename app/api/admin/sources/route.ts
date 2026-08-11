import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/admin-auth';

const createSourceSchema = z.object({
  type: z.enum(['MISHNAH', 'TOSEFTA', 'BAVLI', 'YERUSHALMI', 'MIDRASH', 'GEONIM', 'RISHONIM', 'ACHARONIM', 'HISTORICAL']),
  titleHe: z.string().min(1, 'שם המקור נדרש'),
  author: z.string().nullable().optional(),
  tractate: z.string().nullable().optional(),
  chapter: z.string().nullable().optional(),
  pageRef: z.string().nullable().optional(),
  section: z.string().nullable().optional(),
  quoteHe: z.string().nullable().optional(),
  url: z.string().url('קישור לא תקין').nullable().optional().or(z.literal('')),
  notes: z.string().nullable().optional(),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = createSourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = { ...parsed.data };
    // Normalize empty string URL to null
    if (data.url === '') data.url = null;

    const source = await prisma.source.create({ data });

    await prisma.auditLog.create({
      data: {
        userId: req.session.sub,
        action: 'CREATE',
        entity: 'source',
        entityId: source.id,
        changes: { titleHe: source.titleHe, type: source.type },
      },
    });

    return NextResponse.json({ data: source }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/sources error:', error);
    return NextResponse.json({ error: 'שגיאה ביצירת מקור' }, { status: 500 });
  }
});
