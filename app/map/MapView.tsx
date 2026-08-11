'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PERIODS } from '@/lib/constants';

// ── Fix Leaflet default marker icon in Next.js ──
// @ts-ignore - Leaflet icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Import leaflet CSS ──
import 'leaflet/dist/leaflet.css';

// ── Known location coordinates (fallback for places without lat/lng in DB) ──
const KNOWN_LOCATIONS: Record<string, [number, number]> = {
  ירושלים: [31.7683, 35.2137],
  יבנה: [31.878, 34.738],
  ציפורי: [32.742, 35.279],
  טבריה: [32.7922, 35.5324],
  סורא: [31.88, 44.45],
  פומבדיתא: [33.35, 43.78],
  נהרדעא: [33.38, 43.71],
  'נהר דעא': [33.38, 43.71],
  קיסריה: [32.5, 34.89],
  'בית שערים': [32.703, 35.129],
  לוד: [31.953, 34.893],
  'בני ברק': [32.084, 34.833],
  אושא: [32.798, 35.114],
  שפרעם: [32.804, 35.169],
  'בית לחם': [31.705, 35.202],
  חברון: [31.533, 35.095],
  'ביתר': [31.73, 35.136],
  יפו: [32.05, 34.75],
};

// ── Period color mapping for markers ──
const PERIOD_COLORS: Record<string, string> = {
  ANSHEI_KNESSET: '#059669',
  ZUGOT: '#2563EB',
  TANNAIM: '#D97706',
  AMORAIM_ERETZ_YISRAEL: '#EA580C',
  AMORAIM_BAVEL: '#DC2626',
  SAVORAIM: '#7C3AED',
};

// ── Get color based on scholar count intensity ──
function getCountColor(count: number): string {
  if (count >= 20) return '#DC2626'; // red
  if (count >= 10) return '#EA580C'; // orange
  if (count >= 5) return '#D97706'; // amber
  if (count >= 2) return '#2563EB'; // blue
  return '#059669'; // emerald
}

function getCountSize(count: number): number {
  if (count >= 20) return 44;
  if (count >= 10) return 38;
  if (count >= 5) return 32;
  if (count >= 2) return 28;
  return 24;
}

// ── Types ──
interface PlaceScholar {
  id: string;
  slug: string;
  nameHe: string;
  period: string;
  role: string | null;
  notes: string | null;
}

interface PlaceData {
  id: string;
  nameHe: string;
  nameEn: string | null;
  lat: number | null;
  lng: number | null;
  region: string | null;
  scholarCount: number;
  scholars: PlaceScholar[];
}

interface MapViewProps {
  places: PlaceData[];
}

// ── Fit bounds component ──
function FitBounds({ places }: { places: Array<{ lat: number; lng: number }> }) {
  const map = useMap();

  if (places.length > 0) {
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    // Don't zoom in too tight
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 11);
    } else {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
    }
  }

  return null;
}

export function MapView({ places }: MapViewProps) {
  const router = useRouter();
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  // Enrich places with coordinates, using DB coords first, then known locations
  const geoPlaces = useMemo(() => {
    return places
      .map((p) => {
        // Use DB coordinates if available
        if (p.lat != null && p.lng != null) {
          return { ...p, lat: p.lat, lng: p.lng };
        }
        // Fallback to known locations
        const known = KNOWN_LOCATIONS[p.nameHe];
        if (known) {
          return { ...p, lat: known[0], lng: known[1] };
        }
        return null;
      })
      .filter((p): p is PlaceData & { lat: number; lng: number } => p !== null);
  }, [places]);

  // Period distribution per place (for tooltip/popup)
  const getPeriodDistribution = (scholars: PlaceScholar[]) => {
    const dist: Record<string, number> = {};
    scholars.forEach((s) => {
      dist[s.period] = (dist[s.period] || 0) + 1;
    });
    return dist;
  };

  if (geoPlaces.length === 0) {
    return (
      <div className="flex-1 bg-stone-100 flex items-center justify-center text-stone-400">
        <div className="text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-lg">אין נתוני מיקומים זמינים</p>
          <p className="text-sm mt-1">יש להוסיף מקומות ומקושרים לחכמים במערכת</p>
        </div>
      </div>
    );
  }

  // Default center: Israel/Mesopotamia region
  const defaultCenter: [number, number] = [32.5, 37.0];
  const defaultZoom = 7;

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* Tile layer - OpenStreetMap with Hebrew-friendly carto */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds to all places */}
        <FitBounds
          places={geoPlaces.map((p) => ({ lat: p.lat, lng: p.lng }))}
        />

        {/* Markers */}
        {geoPlaces.map((place) => {
          const count = place.scholarCount;
          const size = getCountSize(count);
          const color = getCountColor(count);
          const isSelected = selectedPlace === place.id;

          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border: ${isSelected ? '3px solid #1F2937' : '2px solid white'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: ${count >= 10 ? '11px' : '10px'};
                font-weight: 700;
                font-family: var(--font-heebo), Heebo, sans-serif;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                transform: translate(-50%, -50%);
                cursor: pointer;
                transition: transform 0.15s;
                ${isSelected ? 'transform: translate(-50%, -50%) scale(1.2);' : ''}
              ">${count}</div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2 - 4],
          });

          const periodDist = getPeriodDistribution(place.scholars);

          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={icon}
              eventHandlers={{
                click: () => setSelectedPlace(place.id),
              }}
            >
              <Popup
                minWidth={240}
                maxWidth={320}
                className="hebrew-popup"
              >
                <div dir="rtl" className="text-right">
                  <h3 className="font-bold text-base text-stone-800 mb-1">
                    {place.nameHe}
                  </h3>
                  {place.nameEn && (
                    <p className="text-xs text-stone-400 mb-2">{place.nameEn}</p>
                  )}
                  <p className="text-sm text-stone-600 mb-2">
                    {place.scholarCount} חכמים קשורים למקום זה
                  </p>

                  {/* Period distribution pills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Object.entries(periodDist).map(([period, c]) => {
                      const pInfo = PERIODS[period as keyof typeof PERIODS];
                      return (
                        <span
                          key={period}
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: PERIOD_COLORS[period] + '20',
                            color: PERIOD_COLORS[period],
                          }}
                        >
                          {pInfo?.label}: {c}
                        </span>
                      );
                    })}
                  </div>

                  {/* Scholar list */}
                  <div className="max-h-48 overflow-y-auto border-t border-stone-100 pt-2">
                    {place.scholars.map((scholar) => (
                      <button
                        key={scholar.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/scholars/${scholar.slug}`);
                        }}
                        className="block w-full text-right px-2 py-1.5 rounded hover:bg-stone-50 transition-colors text-sm text-stone-700 hover:text-amber-700"
                      >
                        <span className="font-medium">{scholar.nameHe}</span>
                        {scholar.role && (
                          <span className="text-stone-400 text-xs mr-2">
                            {scholar.role}
                          </span>
                        )}
                        {scholar.notes && (
                          <span className="block text-xs text-stone-400 mt-0.5">
                            {scholar.notes}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg border border-stone-200 p-3 shadow-sm">
        <p className="text-xs font-bold text-stone-700 mb-2">מספר חכמים</p>
        <div className="space-y-1.5">
          {[
            { min: 20, label: '20+' },
            { min: 10, label: '19-10' },
            { min: 5, label: '9-5' },
            { min: 2, label: '4-2' },
            { min: 1, label: '1' },
          ].map((range) => (
            <div key={range.min} className="flex items-center gap-2 text-xs">
              <span
                className="rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[9px]"
                style={{
                  width: getCountSize(range.min) * 0.6,
                  height: getCountSize(range.min) * 0.6,
                  backgroundColor: getCountColor(range.min),
                }}
              >
                {range.min}
              </span>
              <span className="text-stone-600">{range.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Place list sidebar for quick navigation */}
      <div className="absolute top-3 right-3 z-[1000] max-h-[40vh] overflow-y-auto bg-white/95 backdrop-blur rounded-lg border border-stone-200 shadow-sm w-52">
        <div className="p-2 border-b border-stone-100">
          <p className="text-xs font-bold text-stone-600">מקומות ({geoPlaces.length})</p>
        </div>
        <div className="divide-y divide-stone-50">
          {geoPlaces.map((place) => (
            <button
              key={place.id}
              onClick={() => setSelectedPlace(place.id)}
              className={`w-full text-right px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                selectedPlace === place.id
                  ? 'bg-amber-50 text-amber-800'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span className="truncate">{place.nameHe}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0 mr-2"
                style={{ backgroundColor: getCountColor(place.scholarCount) }}
              >
                {place.scholarCount}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
