'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GEO, LAND_PATH, projectLonLat } from '@/lib/geo/near-east-geo';
import { HISTORICAL_ERAS, RIVERS, type EraKey, type EraSite } from './historical-eras';

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

interface HistoricalMapViewProps {
  eraKey: EraKey;
  places: PlaceData[];
}

const FONT = 'var(--font-heebo), Heebo, sans-serif';
const FONT_DISPLAY = 'var(--font-secular), "Frank Ruhl Libre", serif';

function ringToPath(ring: [number, number][]): string {
  return (
    ring
      .map(([lon, lat], i) => {
        const [x, y] = projectLonLat(lon, lat);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join('') + 'Z'
  );
}

function polyline(points: [number, number][]): string {
  return points
    .map(([lon, lat], i) => {
      const [x, y] = projectLonLat(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join('');
}

/** marker radius for a DB-linked Torah center by scholar count */
function countRadius(count: number): number {
  if (count >= 20) return 11;
  if (count >= 10) return 9.5;
  if (count >= 5) return 8;
  if (count >= 2) return 6.5;
  return 5.5;
}

export function HistoricalMapView({ eraKey, places }: HistoricalMapViewProps) {
  const router = useRouter();
  const era = HISTORICAL_ERAS[eraKey];
  const [selectedSite, setSelectedSite] = useState<EraSite | null>(null);

  const placeByName = useMemo(() => {
    const m = new Map<string, PlaceData>();
    places.forEach((p) => m.set(p.nameHe, p));
    return m;
  }, [places]);

  const selectedPlace = selectedSite?.db ? placeByName.get(selectedSite.db) : undefined;

  return (
    <div className="flex-1 min-h-0 relative bg-[#e8efec]" dir="rtl">
      <div className="absolute inset-0 overflow-auto">
        <div className="min-w-[640px]">
        <svg
          viewBox={`0 0 ${GEO.W} ${GEO.H}`}
          className="w-full h-auto block"
          role="img"
          aria-label={`מפת ${era.labelHe} — ${era.yearsHe}`}
        >
          {/* Sea */}
          <rect x={0} y={0} width={GEO.W} height={GEO.H} fill="#d9e6e6" />

          {/* Land */}
          <path d={LAND_PATH} fill="#f2ecdc" stroke="#b9ac8d" strokeWidth={0.8} />

          {/* Rivers */}
          {RIVERS.map((r) => (
            <path
              key={r.he}
              d={polyline(r.points)}
              fill="none"
              stroke="#7fa8b8"
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={0.85}
            />
          ))}

          {/* Empire polygons */}
          {era.empires.map((emp) =>
            emp.polygons.map((ring, i) => (
              <path
                key={`${emp.nameEn}-${i}`}
                d={ringToPath(ring)}
                fill={emp.color}
                fillOpacity={0.16}
                stroke={emp.color}
                strokeWidth={1.6}
                strokeOpacity={0.55}
                strokeLinejoin="round"
              />
            ))
          )}

          {/* Empire labels */}
          {era.empires.map((emp) => {
            const [lx, ly] = projectLonLat(emp.labelAt[0], emp.labelAt[1]);
            return (
              <g key={`label-${emp.nameEn}`} textAnchor="middle" style={{ pointerEvents: 'none' }}>
                <text
                  x={lx}
                  y={ly}
                  fontSize={17}
                  fontWeight={700}
                  fill={emp.color}
                  opacity={0.85}
                  fontFamily={FONT_DISPLAY}
                  stroke="#f5f0e3"
                  strokeWidth={4}
                  paintOrder="stroke"
                >
                  {emp.nameHe}
                </text>
                <text
                  x={lx}
                  y={ly + 15}
                  fontSize={10.5}
                  fill={emp.color}
                  opacity={0.9}
                  fontFamily={FONT}
                  stroke="#f5f0e3"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {emp.yearsHe ?? era.yearsHe}
                </text>
                <text
                  x={lx}
                  y={ly + 28}
                  fontSize={9.5}
                  fill={emp.color}
                  opacity={0.75}
                  fontFamily={FONT}
                  stroke="#f5f0e3"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {emp.nameEn}
                </text>
              </g>
            );
          })}

          {/* Sites */}
          {era.sites.map((site) => {
            const [sx, sy] = projectLonLat(site.lon, site.lat);
            const dbPlace = site.db ? placeByName.get(site.db) : undefined;
            const hasScholars = !!dbPlace && dbPlace.scholarCount > 0;
            const r = hasScholars ? countRadius(dbPlace.scholarCount) : site.major ? 3.4 : 2.4;
            const anchor = site.anchor ?? 'start';
            const labelX = sx + (site.dx ?? (anchor === 'end' ? -7 : anchor === 'middle' ? 0 : 7));
            const labelY = sy + (site.dy ?? 3);
            const needsLeader = Math.abs(site.dy ?? 0) > 7 || Math.abs(site.dx ?? 0) > 12;
            const isSelected = selectedSite === site;

            return (
              <g
                key={site.he}
                className={hasScholars ? 'cursor-pointer' : undefined}
                onClick={() => hasScholars && setSelectedSite(isSelected ? null : site)}
              >
                {/* leader line for fanned labels */}
                {needsLeader && (
                  <line
                    x1={sx}
                    y1={sy}
                    x2={labelX}
                    y2={labelY - 3}
                    stroke="#78716c"
                    strokeWidth={0.6}
                    opacity={0.6}
                  />
                )}

                {/* marker */}
                {hasScholars ? (
                  <>
                    <circle
                      cx={sx}
                      cy={sy}
                      r={r}
                      fill={isSelected ? '#083f3a' : '#0f6b63'}
                      stroke="white"
                      strokeWidth={1.4}
                      opacity={0.95}
                    />
                    <text
                      x={sx}
                      y={sy + 0.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={r > 8 ? 9 : 8}
                      fontWeight={700}
                      fill="white"
                      fontFamily={FONT}
                      style={{ pointerEvents: 'none' }}
                    >
                      {dbPlace.scholarCount}
                    </text>
                  </>
                ) : (
                  <circle
                    cx={sx}
                    cy={sy}
                    r={r}
                    fill="#1f2937"
                    stroke="white"
                    strokeWidth={1}
                  />
                )}

                {/* bilingual label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={anchor}
                  fontSize={site.major || hasScholars ? 10.5 : 9.5}
                  fontWeight={site.major || hasScholars ? 700 : 500}
                  fill="#292524"
                  fontFamily={FONT}
                  stroke="#f5f0e3"
                  strokeWidth={3}
                  paintOrder="stroke"
                  style={{ pointerEvents: 'none' }}
                >
                  {site.he}
                </text>
                <text
                  x={labelX}
                  y={labelY + 10.5}
                  textAnchor={anchor}
                  fontSize={8}
                  fill="#57534e"
                  fontFamily={FONT}
                  stroke="#f5f0e3"
                  strokeWidth={2.5}
                  paintOrder="stroke"
                  style={{ pointerEvents: 'none' }}
                >
                  {site.en}
                </text>
              </g>
            );
          })}

          {/* Schematic disclaimer */}
          <text
            x={GEO.W - 8}
            y={GEO.H - 8}
            textAnchor="end"
            fontSize={9}
            fill="#78716c"
            fontFamily={FONT}
          >
            מפה סכמטית — גבולות משוערים להמחשה בלבד · Schematic map
          </text>
        </svg>
        </div>
      </div>

      {/* Era note */}
      {era.noteHe && (
        <div className="absolute bottom-3 right-3 z-[500] max-w-xs bg-surface/95 backdrop-blur rounded-lg border border-line px-3 py-2 shadow-card">
          <p className="text-xs text-ink-soft leading-relaxed">{era.noteHe}</p>
        </div>
      )}

      {/* Selected Torah-center scholar panel */}
      {selectedPlace && selectedSite && (
        <div className="absolute top-3 left-3 z-[600] w-64 max-h-[70%] overflow-y-auto bg-surface/95 backdrop-blur rounded-lg border border-line shadow-card">
          <div className="p-3 border-b border-line sticky top-0 bg-surface/95 flex items-start justify-between gap-2">
            <div>
              <p className="font-display font-bold text-ink">{selectedSite.he}</p>
              <p className="text-xs text-ink-muted">
                {selectedSite.en} · {selectedPlace.scholarCount} חכמים
              </p>
            </div>
            <button
              onClick={() => setSelectedSite(null)}
              className="text-ink-muted hover:text-ink text-lg leading-none px-1"
              aria-label="סגור"
            >
              ×
            </button>
          </div>
          <div className="divide-y divide-line/60">
            {selectedPlace.scholars.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/scholars/${s.slug}`)}
                className="block w-full text-right px-3 py-2 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent-dark transition-colors"
              >
                <span className="font-medium">{s.nameHe}</span>
                {s.role && <span className="text-ink-muted text-xs mr-2">{s.role}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
