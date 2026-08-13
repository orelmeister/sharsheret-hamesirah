import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { prisma } from '@/lib/prisma';
import { MapLoader } from './MapLoader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'מפות',
  description: 'מפות — מרכזי תורה בארץ ישראל ובבל, ומפות תקופתיות: בבל, פרס, יוון ורומא',
};

interface PlaceData {
  id: string;
  nameHe: string;
  nameEn: string | null;
  lat: number | null;
  lng: number | null;
  region: string | null;
  scholarCount: number;
  scholars: {
    id: string;
    slug: string;
    nameHe: string;
    period: string;
    role: string | null;
    notes: string | null;
  }[];
}

async function getPlacesData(): Promise<PlaceData[]> {
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

  const enriched = places
    .filter((p) => p.scholarPlaces.length > 0)
    .map((p) => ({
      id: p.id,
      nameHe: p.nameHe,
      nameEn: p.nameEn,
      lat: p.lat,
      lng: p.lng,
      region: p.region,
      scholarCount: p.scholarPlaces.length,
      scholars: p.scholarPlaces.map((sp) => ({
        id: sp.scholar.id,
        slug: sp.scholar.slug,
        nameHe: sp.scholar.nameHe,
        period: sp.scholar.period,
        role: sp.scholar.role,
        notes: sp.notes,
      })),
    }));

  return enriched;
}

export default async function MapPage() {
  const places = await getPlacesData();

  return (
    <>
      <Header />
      <main className="flex flex-col h-[calc(100vh-56px)]">
        <div className="shrink-0 px-4 py-3 border-b border-line bg-surface">
          <h1 className="font-display text-2xl font-bold text-ink">מפות</h1>
          <p className="text-sm text-ink-muted">
            מרכזי תורה במפה מודרנית ובמפות תקופתיות — בבל, פרס, יוון ורומא
          </p>
        </div>
        <MapLoader places={places} />
      </main>
    </>
  );
}
