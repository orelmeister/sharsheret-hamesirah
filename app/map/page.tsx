import { Metadata } from 'next';
import NextDynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'מפה',
  description: 'מפה אינטראקטיבית — מרכזי תורה בארץ ישראל ובבל',
};

// Dynamically import MapView with SSR disabled (Leaflet needs browser APIs)
const MapView = NextDynamic(() => import('./MapView').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-stone-100 flex items-center justify-center">
      <div className="text-center text-stone-400">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-lg">טוען מפה...</p>
      </div>
    </div>
  ),
});

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
      <main className="flex flex-col h-[calc(100vh-57px)]">
        <div className="shrink-0 px-4 py-4 border-b border-stone-200 bg-white">
          <h1 className="font-display text-2xl text-stone-800">מפה</h1>
          <p className="text-sm text-stone-500">
            מרכזי תורה בארץ ישראל ובבל — {places.length} מקומות
          </p>
        </div>
        <MapView places={places} />
      </main>
    </>
  );
}
