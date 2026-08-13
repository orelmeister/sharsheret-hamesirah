'use client';

import { useState } from 'react';
import { MapView } from './MapView';
import { HistoricalMapView } from './HistoricalMapView';
import { ERA_ORDER, HISTORICAL_ERAS, type EraKey } from './historical-eras';

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

type TabKey = 'MODERN' | EraKey;

export type MapLang = 'he' | 'en';

export function MapsExplorer({ places }: { places: PlaceData[] }) {
  const [tab, setTab] = useState<TabKey>('MODERN');
  const [lang, setLang] = useState<MapLang>('he');

  const tabs: { key: TabKey; label: string; sub?: string }[] = [
    { key: 'MODERN', label: 'מפה מודרנית' },
    ...ERA_ORDER.map((k) => ({
      key: k as TabKey,
      label: HISTORICAL_ERAS[k].labelHe,
      sub: HISTORICAL_ERAS[k].yearsHe,
    })),
  ];

  const activeEra = tab !== 'MODERN' ? HISTORICAL_ERAS[tab] : null;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Tab bar */}
      <div className="shrink-0 bg-surface border-b border-line px-2 py-1.5 flex items-center gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-accent text-white font-semibold'
                : 'text-ink-soft hover:bg-parchment-dark'
            }`}
          >
            {t.label}
            {t.sub && tab === t.key && (
              <span className="text-[10px] opacity-80 font-normal mr-1.5">{t.sub}</span>
            )}
          </button>
        ))}

        {/* Language toggle — modern map only */}
        {tab === 'MODERN' && (
          <div className="mr-auto flex items-center gap-1 bg-parchment-dark rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setLang('he')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                lang === 'he' ? 'bg-white shadow-sm font-semibold text-ink' : 'text-ink-muted'
              }`}
            >
              עברית
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                lang === 'en' ? 'bg-white shadow-sm font-semibold text-ink' : 'text-ink-muted'
              }`}
            >
              English
            </button>
          </div>
        )}
      </div>

      {/* Era header strip for historical maps */}
      {activeEra && (
        <div className="shrink-0 bg-parchment-dark/60 border-b border-line px-4 py-1.5 flex items-baseline gap-3 flex-wrap">
          <span className="font-display font-bold text-ink">
            {activeEra.labelHe} <span className="text-ink-muted font-normal text-sm">({activeEra.labelEn})</span>
          </span>
          <span className="text-sm text-accent-dark font-medium">{activeEra.yearsHe}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        {tab === 'MODERN' ? (
          <MapView places={places} lang={lang} />
        ) : (
          <HistoricalMapView eraKey={tab} places={places} />
        )}
      </div>
    </div>
  );
}
