'use client';

import dynamic from 'next/dynamic';

// Leaflet touches `window` at import time, so the whole maps explorer must
// only ever load in the browser. `next/dynamic` with `ssr:false` is only
// honored inside a Client Component in the App Router — hence this wrapper.
const MapsExplorer = dynamic(
  () => import('./MapsExplorer').then((mod) => mod.MapsExplorer),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-stone-100 flex items-center justify-center">
        <div className="text-center text-stone-400">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-lg">טוען מפות...</p>
        </div>
      </div>
    ),
  }
);

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

export function MapLoader({ places }: { places: PlaceData[] }) {
  return <MapsExplorer places={places} />;
}
