'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PERIODS, PERIOD_ORDER } from '@/lib/constants';

// ── Types ──
interface TimelineScholar {
  id: string;
  slug: string;
  nameHe: string;
  period: string;
  role: string | null;
  birthStart: number | null;
  birthEnd: number | null;
  deathStart: number | null;
  deathEnd: number | null;
  dateConfidence: string;
  generation: { nameHe: string; order: number } | null;
}

interface TimelineEvent {
  id: string;
  titleHe: string;
  dateStart: number | null;
  dateEnd: number | null;
  description: string | null;
  category: string | null;
  place: { nameHe: string } | null;
}

interface TimelineViewProps {
  scholars: TimelineScholar[];
  events: TimelineEvent[];
}

// ── Color mapping ──
const PERIOD_COLORS: Record<string, string> = {
  ANSHEI_KNESSET: '#5f7d54',
  ZUGOT: '#3d5a8a',
  TANNAIM: '#a8792c',
  AMORAIM_ERETZ_YISRAEL: '#b0603a',
  AMORAIM_BAVEL: '#9e3b3b',
  SAVORAIM: '#4b5266',
};

const EVENT_CATEGORY_COLORS: Record<string, string> = {
  EREZ_YISRAEL: '#a8792c',
  WORLD: '#6B7280',
  JEWISH_HISTORY: '#0f6b63',
};

// ── Constants ──
const YEAR_MIN = -350;
const YEAR_MAX = 600;
const YEAR_RANGE = YEAR_MAX - YEAR_MIN;

const LEFT_PAD = 60;
const RIGHT_PAD = 60;
const TOP_PAD = 20;
const TIMELINE_Y = 60;
const EVENT_ROW_Y = 100;
const SCHOLAR_ROW_START_Y = 140;
const ROW_HEIGHT = 26;
const MAX_ROWS = 44; // enough lanes to avoid forced overlap across all periods

export function TimelineView({ scholars, events }: TimelineViewProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'scholar' | 'event';
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter scholars
  const filteredScholars = useMemo(
    () =>
      activePeriod
        ? scholars.filter((s) => s.period === activePeriod)
        : scholars,
    [scholars, activePeriod]
  );

  // Assign rows to avoid overlap
  const scholarRows = useMemo(() => {
    const rows: { scholar: TimelineScholar; x: number; row: number; width: number }[] = [];
    const rowEnds: number[] = [];
    const MIN_GAP = 8; // Minimum pixel gap between items

    filteredScholars.forEach((s) => {
      const midYear = getMidYear(s);
      if (midYear === null) return;

      const x = yearToX(midYear, viewBox.w - LEFT_PAD - RIGHT_PAD) + LEFT_PAD;
      const w = getScholarWidth(s);

      // Find a row where this scholar fits
      let assignedRow = -1;
      for (let r = 0; r < MAX_ROWS; r++) {
        if (!rowEnds[r] || x > rowEnds[r] + MIN_GAP) {
          assignedRow = r;
          break;
        }
      }
      // If every lane is occupied at this x, add a brand-new lane rather than
      // forcing an overlap into row 0.
      if (assignedRow === -1) assignedRow = rowEnds.length;

      const scholarX = Math.max(LEFT_PAD, x - w / 2);
      rowEnds[assignedRow] = scholarX + w;
      rows.push({ scholar: s, x: scholarX, row: assignedRow, width: w });
    });

    return rows;
  }, [filteredScholars, viewBox.w]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    const usedRows = new Set(scholarRows.map((r) => r.row));
    return SCHOLAR_ROW_START_Y + Math.max(1, usedRows.size) * ROW_HEIGHT + 60;
  }, [scholarRows]);

  // Helpers
  function yearToX(year: number, chartWidth: number): number {
    return ((year - YEAR_MIN) / YEAR_RANGE) * chartWidth;
  }

  function getMidYear(s: TimelineScholar): number | null {
    const years: number[] = [];
    if (s.birthStart != null) years.push(s.birthStart);
    if (s.birthEnd != null) years.push(s.birthEnd);
    if (s.deathStart != null) years.push(s.deathStart);
    if (s.deathEnd != null) years.push(s.deathEnd);
    if (years.length === 0) return null;
    return years.reduce((a, b) => a + b, 0) / years.length;
  }

  function getScholarWidth(s: TimelineScholar): number {
    // Estimate width from name length (Hebrew chars ~12px at text-xs)
    const len = s.nameHe.length;
    return Math.max(60, len * 7 + 16);
  }

  function formatYear(y: number): string {
    if (y < 0) return `${Math.abs(y)} לפנה״ס`;
    return `${y} לספירה`;
  }

  // Zoom and pan handlers
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const scale = e.deltaY > 0 ? 1.1 : 0.9;
      setViewBox((vb) => ({
        ...vb,
        w: Math.max(400, Math.min(4000, vb.w * scale)),
        h: totalHeight,
      }));
    },
    [totalHeight]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - dragStart.x) * (viewBox.w / (containerRef.current?.clientWidth || 800));
      setViewBox((vb) => ({ ...vb, x: vb.x - dx, h: totalHeight }));
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, viewBox.w, totalHeight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Generate year ticks
  const yearTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = viewBox.w > 2000 ? 50 : viewBox.w > 1200 ? 100 : 200;
    for (let y = YEAR_MIN; y <= YEAR_MAX; y += step) {
      ticks.push(y);
    }
    return ticks;
  }, [viewBox.w]);

  // Highlighted tick years (major events)
  const highlightedYears = useMemo(
    () => new Set([0, -70, 70, -200, -350, 220, 500]),
    []
  );

  const chartWidth = viewBox.w - LEFT_PAD - RIGHT_PAD;

  const scholarForHover = useMemo(() => {
    if (!hoveredItem || hoveredItem.type !== 'scholar') return null;
    return scholars.find((s) => s.id === hoveredItem.id) || null;
  }, [hoveredItem, scholars]);

  const eventForHover = useMemo(() => {
    if (!hoveredItem || hoveredItem.type !== 'event') return null;
    return events.find((e) => e.id === hoveredItem.id) || null;
  }, [hoveredItem, events]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-stone-50 overflow-hidden relative select-none"
      dir="rtl"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Period filter tabs */}
      <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-1 bg-white/90 backdrop-blur rounded-lg border border-stone-200 p-1 shadow-sm">
        <button
          onClick={() => setActivePeriod(null)}
          className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
            !activePeriod ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          הכל
        </button>
        {PERIOD_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setActivePeriod(activePeriod === key ? null : key)}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap ${
              activePeriod === key
                ? 'bg-stone-800 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {PERIODS[key].label}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 left-3 z-20 flex gap-1">
        <button
          onClick={() =>
            setViewBox((vb) => ({
              ...vb,
              w: Math.max(400, vb.w / 1.3),
              h: totalHeight,
            }))
          }
          className="w-8 h-8 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 shadow-sm text-sm"
          title="הגדל"
        >
          +
        </button>
        <button
          onClick={() =>
            setViewBox((vb) => ({
              ...vb,
              w: Math.min(4000, vb.w * 1.3),
              h: totalHeight,
            }))
          }
          className="w-8 h-8 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 shadow-sm text-sm"
          title="הקטן"
        >
          −
        </button>
        <button
          onClick={() =>
            setViewBox({ x: 0, y: 0, w: 1200, h: totalHeight })
          }
          className="w-8 h-8 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 shadow-sm text-sm"
          title="איפוס"
        >
          ↺
        </button>
      </div>

      {/* SVG Timeline */}
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${totalHeight}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect x={0} y={0} width={viewBox.w} height={totalHeight} fill="#FAFAF9" />

        {/* Period background bands */}
        {PERIOD_ORDER.map((key) => {
          const p = PERIODS[key];
          const x1 = yearToX(p.startYear, chartWidth) + LEFT_PAD;
          const x2 = yearToX(p.endYear, chartWidth) + LEFT_PAD;
          return (
            <rect
              key={key}
              x={Math.min(x1, x2)}
              y={0}
              width={Math.abs(x2 - x1)}
              height={totalHeight}
              fill={PERIOD_COLORS[key]}
              opacity={0.05}
            />
          );
        })}

        {/* Main timeline line */}
        <line
          x1={LEFT_PAD}
          y1={TIMELINE_Y}
          x2={viewBox.w - RIGHT_PAD}
          y2={TIMELINE_Y}
          stroke="#D6D3D1"
          strokeWidth={2}
        />

        {/* Year ticks */}
        {yearTicks.map((year) => {
          const x = yearToX(year, chartWidth) + LEFT_PAD;
          const isMajor = highlightedYears.has(year);
          return (
            <g key={year}>
              <line
                x1={x}
                y1={TIMELINE_Y - (isMajor ? 12 : 6)}
                x2={x}
                y2={TIMELINE_Y + (isMajor ? 12 : 6)}
                stroke={isMajor ? '#78716C' : '#A8A29E'}
                strokeWidth={isMajor ? 1.5 : 0.5}
              />
              <text
                x={x}
                y={TIMELINE_Y + (isMajor ? 26 : 16)}
                textAnchor="middle"
                fontSize={isMajor ? 11 : 9}
                fill={isMajor ? '#78716C' : '#A8A29E'}
                fontFamily="var(--font-heebo), Heebo, sans-serif"
              >
                {formatYear(year)}
              </text>
              {/* Era labels */}
              {year === 0 && (
                <text
                  x={x}
                  y={TIMELINE_Y - 18}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#78716C"
                  fontWeight={600}
                  fontFamily="var(--font-heebo), Heebo, sans-serif"
                >
                  ספירת הנוצרים
                </text>
              )}
            </g>
          );
        })}

        {/* Period labels above ticks */}
        {PERIOD_ORDER.map((key) => {
          const p = PERIODS[key];
          const midX = yearToX((p.startYear + p.endYear) / 2, chartWidth) + LEFT_PAD;
          return (
            <text
              key={`label-${key}`}
              x={midX}
              y={TIMELINE_Y - 24}
              textAnchor="middle"
              fontSize={10}
              fill={PERIOD_COLORS[key]}
              fontWeight={600}
              fontFamily="var(--font-heebo), Heebo, sans-serif"
            >
              {p.label}
            </text>
          );
        })}

        {/* Historical events */}
        {events
          .filter((evt) => evt.dateStart != null)
          .map((evt) => {
            const x = yearToX(evt.dateStart!, chartWidth) + LEFT_PAD;
            const color = EVENT_CATEGORY_COLORS[evt.category || ''] || '#6B7280';
            return (
              <g key={`event-${evt.id}`}>
                {/* Vertical connector */}
                <line
                  x1={x}
                  y1={TIMELINE_Y + 2}
                  x2={x}
                  y2={EVENT_ROW_Y}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="3,2"
                  opacity={0.5}
                />
                {/* Diamond marker */}
                <polygon
                  points={`${x},${EVENT_ROW_Y - 6} ${x - 5},${EVENT_ROW_Y} ${x},${EVENT_ROW_Y + 6} ${x + 5},${EVENT_ROW_Y}`}
                  fill={color}
                  opacity={0.7}
                  stroke={color}
                  strokeWidth={1}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => {
                    if (evt.description) {
                      alert(`${evt.titleHe}\n\n${evt.description}${evt.place ? `\nמיקום: ${evt.place.nameHe}` : ''}`);
                    }
                  }}
                  onMouseEnter={() =>
                    setHoveredItem({ type: 'event', id: evt.id, x, y: EVENT_ROW_Y })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                />
              </g>
            );
          })}

        {/* Scholars on timeline */}
        {scholarRows.map(({ scholar, x, row, width }) => {
          const color = PERIOD_COLORS[scholar.period] || '#6B7280';
          const y = SCHOLAR_ROW_START_Y + row * ROW_HEIGHT;
          const midYear = getMidYear(scholar);
          const midX = midYear ? yearToX(midYear, chartWidth) + LEFT_PAD : x;
          const hasUncertainty =
            scholar.dateConfidence === 'DISPUTED' ||
            scholar.dateConfidence === 'UNKNOWN' ||
            scholar.dateConfidence === 'TRADITIONAL';

          return (
            <g
              key={scholar.id}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/scholars/${scholar.slug}`);
              }}
              onMouseEnter={() =>
                setHoveredItem({ type: 'scholar', id: scholar.id, x: midX, y })
              }
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Uncertainty range bar */}
              {hasUncertainty && scholar.birthStart != null && scholar.deathEnd != null && (
                <line
                  x1={yearToX(scholar.birthStart, chartWidth) + LEFT_PAD}
                  y1={y + ROW_HEIGHT / 2}
                  x2={yearToX(scholar.deathEnd, chartWidth) + LEFT_PAD}
                  y2={y + ROW_HEIGHT / 2}
                  stroke={color}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={0.15}
                />
              )}

              {/* Connector line to timeline */}
              <line
                x1={midX}
                y1={TIMELINE_Y + 2}
                x2={midX}
                y2={y + ROW_HEIGHT / 2}
                stroke={color}
                strokeWidth={0.5}
                opacity={0.2}
              />

              {/* Scholar dot/bubble */}
              <rect
                x={x}
                y={y}
                width={width}
                height={ROW_HEIGHT - 4}
                rx={6}
                fill="white"
                stroke={color}
                strokeWidth={1.5}
                className="hover:stroke-2 hover:opacity-90 transition-all"
              />
              <text
                x={x + width / 2}
                y={y + ROW_HEIGHT / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fill="#1F2937"
                fontFamily="var(--font-heebo), Heebo, sans-serif"
                className="pointer-events-none"
              >
                {scholar.nameHe}
              </text>
            </g>
          );
        })}

        {/* Timeline end arrows */}
        <polygon
          points={`${LEFT_PAD},${TIMELINE_Y} ${LEFT_PAD + 8},${TIMELINE_Y - 5} ${LEFT_PAD + 8},${TIMELINE_Y + 5}`}
          fill="#A8A29E"
        />
        <polygon
          points={`${viewBox.w - RIGHT_PAD},${TIMELINE_Y} ${viewBox.w - RIGHT_PAD - 8},${TIMELINE_Y - 5} ${viewBox.w - RIGHT_PAD - 8},${TIMELINE_Y + 5}`}
          fill="#A8A29E"
        />
      </svg>

      {/* Tooltip */}
      {hoveredItem && (
        <div
          className="absolute z-30 bg-white border border-stone-200 rounded-lg shadow-lg p-2 text-xs max-w-[200px]"
          style={{
            left: Math.min(
              hoveredItem.x * (containerRef.current?.clientWidth || 800) / viewBox.w + 10,
              (containerRef.current?.clientWidth || 800) - 210
            ),
            top: hoveredItem.y * (containerRef.current?.clientHeight || 600) / totalHeight + 30,
          }}
        >
          {hoveredItem.type === 'scholar' && scholarForHover && (
            <div>
              <p className="font-bold text-stone-800">{scholarForHover.nameHe}</p>
              {scholarForHover.role && (
                <p className="text-stone-500">{scholarForHover.role}</p>
              )}
              <p className="text-stone-400 mt-0.5">
                {PERIODS[scholarForHover.period as keyof typeof PERIODS]?.label}
              </p>
              {scholarForHover.generation && (
                <p className="text-stone-400">דור: {scholarForHover.generation.nameHe}</p>
              )}
              {(scholarForHover.birthStart != null || scholarForHover.deathEnd != null) && (
                <p className="text-stone-400 mt-0.5">
                  {scholarForHover.birthStart != null && formatYear(scholarForHover.birthStart)}
                  {scholarForHover.birthStart != null && scholarForHover.deathEnd != null && ' – '}
                  {scholarForHover.deathEnd != null && formatYear(scholarForHover.deathEnd)}
                </p>
              )}
            </div>
          )}
          {hoveredItem.type === 'event' && eventForHover && (
            <div>
              <p className="font-bold text-stone-800">{eventForHover.titleHe}</p>
              {eventForHover.description && (
                <p className="text-stone-500 mt-0.5 line-clamp-2">{eventForHover.description}</p>
              )}
              {eventForHover.place && (
                <p className="text-stone-400 mt-0.5">📍 {eventForHover.place.nameHe}</p>
              )}
              {eventForHover.dateStart != null && (
                <p className="text-stone-400">{formatYear(eventForHover.dateStart)}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {scholars.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-stone-400 pointer-events-none">
          <div className="text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-lg">אין נתוני ציר זמן זמינים</p>
            <p className="text-sm mt-1">יש להוסיף חכמים עם תאריכים למערכת</p>
          </div>
        </div>
      )}
    </div>
  );
}
