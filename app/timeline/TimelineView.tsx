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

// ── Layout constants ──
const YEAR_MIN = -350;
const YEAR_MAX = 600;
const YEAR_RANGE = YEAR_MAX - YEAR_MIN;

/** Logical chart width at zoom=1 (1 SVG unit == 1 CSS px — nothing is ever
 *  scaled down to fit; vertical overflow scrolls instead). */
const BASE_W = 1150;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 10;

const PAD_L = 56;
const PAD_R = 36;

const RULER_H = 64; // sticky top ruler (period segments + year ticks)
const SEG_BAR_Y = 6;
const SEG_BAR_H = 20;
const TICK_LABEL_Y = 50;
const TICK_LINE_Y = 58;

const EVENT_LANE_Y = 44;
const EVENTS_SECTION_H = 84;
const SCHOLAR_HEADER_Y = EVENTS_SECTION_H + 12;
const ROWS_TOP = SCHOLAR_HEADER_Y + 14;
const ROW_HEIGHT = 26;
const BOTTOM_PAD = 44;

const FONT = 'var(--font-heebo), Heebo, sans-serif';

/** Canonical, non-overlapping era segments for the ruler + background bands
 *  (the two Amoraim periods run in parallel years, so they merge into one). */
const ERA_SEGMENTS = [
  { key: 'ANSHEI_KNESSET', label: 'אנשי כנסת הגדולה', start: -350, end: -190, color: PERIOD_COLORS.ANSHEI_KNESSET },
  { key: 'ZUGOT', label: 'הזוגות', start: -190, end: 10, color: PERIOD_COLORS.ZUGOT },
  { key: 'TANNAIM', label: 'תנאים', start: 10, end: 220, color: PERIOD_COLORS.TANNAIM },
  { key: 'AMORAIM', label: 'אמוראים', start: 220, end: 500, color: '#a14d33' },
  { key: 'SAVORAIM', label: 'סבוראים', start: 500, end: 589, color: PERIOD_COLORS.SAVORAIM },
];

export function TimelineView({ scholars, events }: TimelineViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const rangeChipRef = useRef<HTMLSpanElement>(null);
  const [zoom, setZoom] = useState(1);
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'scholar' | 'event';
    id: string;
    x: number;
    y: number;
  } | null>(null);

  // drag / pinch state (refs — no re-render while panning)
  const dragRef = useRef<{ startX: number; startY: number; scrollL: number; scrollT: number } | null>(null);
  const draggedRef = useRef(false);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; zoom: number; midX: number; scrollL: number } | null>(null);
  const zoomAnchorRef = useRef<{ contentX: number; viewportX: number } | null>(null);

  const L = BASE_W * zoom;
  const chartW = L - PAD_L - PAD_R;

  const yearToX = useCallback(
    (year: number) => PAD_L + ((year - YEAR_MIN) / YEAR_RANGE) * chartW,
    [chartW]
  );

  // ── Data ──
  const datedScholars = useMemo(
    () => scholars.filter((s) => getMidYear(s) !== null),
    [scholars]
  );
  const undatedCount = scholars.length - datedScholars.length;

  const filteredScholars = useMemo(
    () => (activePeriod ? datedScholars.filter((s) => s.period === activePeriod) : datedScholars),
    [datedScholars, activePeriod]
  );

  // Lane packing — sorted by mid-year, greedy into first free lane.
  const scholarRows = useMemo(() => {
    const sorted = [...filteredScholars].sort(
      (a, b) => (getMidYear(a) ?? 0) - (getMidYear(b) ?? 0)
    );
    const rows: { scholar: TimelineScholar; x: number; row: number; width: number }[] = [];
    const rowEnds: number[] = [];
    const MIN_GAP = 6;

    for (const s of sorted) {
      const mid = getMidYear(s)!;
      const w = getScholarWidth(s);
      const cx = yearToX(mid);
      const x = Math.max(PAD_L - w / 2, cx - w / 2);

      let r = 0;
      while (r < rowEnds.length && x <= rowEnds[r] + MIN_GAP) r++;
      if (r === rowEnds.length) rowEnds.push(-Infinity);
      rowEnds[r] = x + w;
      rows.push({ scholar: s, x, row: r, width: w });
    }
    return rows;
  }, [filteredScholars, yearToX]);

  const rowCount = useMemo(
    () => scholarRows.reduce((m, r) => Math.max(m, r.row + 1), 0),
    [scholarRows]
  );
  const totalH = ROWS_TOP + Math.max(1, rowCount) * ROW_HEIGHT + BOTTOM_PAD;

  const timelineEvents = useMemo(
    () =>
      events
        .filter((e) => e.dateStart != null)
        .sort((a, b) => (a.dateStart ?? 0) - (b.dateStart ?? 0)),
    [events]
  );

  // ── Year ticks: minor tick every 25y, label density adapts to zoom ──
  const { minorTicks, labeledTicks } = useMemo(() => {
    const pxPer25 = 25 * (chartW / YEAR_RANGE);
    const step = pxPer25 >= 52 ? 25 : pxPer25 * 2 >= 52 ? 50 : pxPer25 * 4 >= 52 ? 100 : 200;
    const minors: number[] = [];
    const labeled: number[] = [];
    for (let y = Math.ceil(YEAR_MIN / 25) * 25; y <= YEAR_MAX; y += 25) {
      minors.push(y);
      if (y % step === 0) labeled.push(y);
    }
    return { minorTicks: minors, labeledTicks: labeled, step };
  }, [chartW]);

  // ── Helpers ──
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
    return Math.max(44, s.nameHe.length * 6.2 + 12);
  }

  function formatYear(y: number): string {
    return y < 0 ? `${Math.abs(y)} לפנה״ס` : `${y} לספירה`;
  }

  // ── Zoom ──
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const applyZoom = useCallback(
    (next: number, anchorViewportX?: number) => {
      const el = scrollRef.current;
      const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
      if (el && anchorViewportX != null) {
        zoomAnchorRef.current = {
          contentX: el.scrollLeft + anchorViewportX,
          viewportX: anchorViewportX,
        };
      } else {
        zoomAnchorRef.current = null;
      }
      setZoom(clamped);
    },
    []
  );

  // After zoom changes L, adjust scrollLeft so the anchor point stays put.
  const prevLRef = useRef(L);
  useEffect(() => {
    const el = scrollRef.current;
    const anchor = zoomAnchorRef.current;
    if (el && anchor && prevLRef.current !== L) {
      const fraction = anchor.contentX / prevLRef.current;
      el.scrollLeft = fraction * L - anchor.viewportX;
      zoomAnchorRef.current = null;
    }
    prevLRef.current = L;
  }, [L]);

  // Initial zoom: fit the whole range to the container width
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const fit = el.clientWidth / BASE_W;
    setZoom(Math.max(ZOOM_MIN, Math.min(1.05, fit)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Native wheel listener (React attaches passive listeners; ctrl+wheel must
  // preventDefault to avoid the browser page-zoom).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain wheel = native vertical scroll
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = e.deltaY > 0 ? 1 / 1.18 : 1.18;
      applyZoom(zoomRef.current * factor, e.clientX - rect.left);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoom]);

  // ── Drag pan + pinch (window listeners so clicks still fire) ──
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const el = scrollRef.current;
    if (!el) return;

    if (pointersRef.current.size === 1) {
      draggedRef.current = false;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        scrollL: el.scrollLeft,
        scrollT: el.scrollTop,
      };
    } else if (pointersRef.current.size === 2) {
      dragRef.current = null;
      const [p1, p2] = [...pointersRef.current.values()];
      pinchRef.current = {
        dist: Math.hypot(p2.x - p1.x, p2.y - p1.y),
        zoom: zoomRef.current,
        midX: (p1.x + p2.x) / 2 - el.getBoundingClientRect().left,
        scrollL: el.scrollLeft,
      };
    }

    const move = (ev: PointerEvent) => {
      if (!pointersRef.current.has(ev.pointerId)) return;
      pointersRef.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      const el2 = scrollRef.current;
      if (!el2) return;

      if (pinchRef.current && pointersRef.current.size === 2) {
        const [p1, p2] = [...pointersRef.current.values()];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const p = pinchRef.current;
        applyZoom(p.zoom * (dist / Math.max(40, p.dist)), p.midX);
        draggedRef.current = true;
        return;
      }

      const d = dragRef.current;
      if (!d) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (!draggedRef.current && Math.hypot(dx, dy) < 4) return;
      draggedRef.current = true;
      el2.scrollLeft = d.scrollL - dx;
      el2.scrollTop = d.scrollT - dy;
    };
    const up = (ev: PointerEvent) => {
      pointersRef.current.delete(ev.pointerId);
      if (pointersRef.current.size < 2) pinchRef.current = null;
      if (pointersRef.current.size === 0) {
        dragRef.current = null;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        // let the trailing click see `dragged`, then reset
        setTimeout(() => (draggedRef.current = false), 0);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }, [applyZoom]);

  // visible-range chip — updated via DOM to avoid re-rendering on scroll
  const updateRangeChip = useCallback(() => {
    const el = scrollRef.current;
    const chip = rangeChipRef.current;
    if (!el || !chip) return;
    const x0 = el.scrollLeft;
    const x1 = el.scrollLeft + el.clientWidth;
    const y0 = YEAR_MIN + ((x0 - PAD_L) / chartW) * YEAR_RANGE;
    const y1 = YEAR_MIN + ((x1 - PAD_L) / chartW) * YEAR_RANGE;
    chip.textContent = `מוצג: ${formatYear(Math.round(y0 / 5) * 5)} – ${formatYear(Math.round(y1 / 5) * 5)}`;
  }, [chartW]);

  useEffect(() => {
    updateRangeChip();
  }, [updateRangeChip, zoom]);

  // ── Zoom to a specific segment (period segments in the ruler) ──
  const zoomToRange = useCallback(
    (y0: number, y1: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const span = y1 - y0;
      const targetChartW = el.clientWidth * 0.9;
      const nextL = (targetChartW * YEAR_RANGE) / span + PAD_L + PAD_R;
      const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nextL / BASE_W));
      setZoom(nextZoom);
      // after L updates, center the segment
      requestAnimationFrame(() => {
        const el2 = scrollRef.current;
        if (!el2) return;
        const newChartW = BASE_W * nextZoom - PAD_L - PAD_R;
        const cx = PAD_L + ((y0 + span / 2 - YEAR_MIN) / YEAR_RANGE) * newChartW;
        el2.scrollLeft = Math.max(0, cx - el2.clientWidth / 2);
      });
    },
    []
  );

  const scholarForHover = useMemo(() => {
    if (!hoveredItem || hoveredItem.type !== 'scholar') return null;
    return scholars.find((s) => s.id === hoveredItem.id) || null;
  }, [hoveredItem, scholars]);

  const eventForHover = useMemo(() => {
    if (!hoveredItem || hoveredItem.type !== 'event') return null;
    return events.find((e) => e.id === hoveredItem.id) || null;
  }, [hoveredItem, events]);

  const hoverScreenPos = useMemo(() => {
    if (!hoveredItem) return null;
    const el = scrollRef.current;
    if (!el) return null;
    return {
      left: Math.min(hoveredItem.x - el.scrollLeft + 12, el.clientWidth - 220),
      top: hoveredItem.y - el.scrollTop + RULER_H + 12,
    };
  }, [hoveredItem]);

  return (
    <div className="flex-1 bg-stone-50 relative select-none" dir="rtl">
      {/* Period filter tabs */}
      <div className="absolute top-2 right-2 z-30 flex flex-wrap gap-1 bg-white/90 backdrop-blur rounded-lg border border-stone-200 p-1 shadow-sm max-w-[60%]">
        <button
          onClick={() => setActivePeriod(null)}
          className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
            !activePeriod ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          הכל
        </button>
        {PERIOD_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setActivePeriod(activePeriod === key ? null : key)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap ${
              activePeriod === key ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {PERIODS[key].label}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-2 left-2 z-30 flex gap-1">
        <button
          onClick={() => applyZoom(zoom * 1.35)}
          className="w-8 h-8 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 shadow-sm text-sm"
          title="הגדל"
        >
          +
        </button>
        <button
          onClick={() => applyZoom(zoom / 1.35)}
          className="w-8 h-8 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 shadow-sm text-sm"
          title="הקטן"
        >
          −
        </button>
        <button
          onClick={() => {
            const el = scrollRef.current;
            setZoom(el ? Math.max(ZOOM_MIN, Math.min(1.05, el.clientWidth / BASE_W)) : 1);
            el?.scrollTo({ left: 0, top: 0 });
          }}
          className="w-8 h-8 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 shadow-sm text-sm"
          title="איפוס"
        >
          ↺
        </button>
      </div>

      {/* Visible-range chip */}
      <span
        ref={rangeChipRef}
        className="absolute bottom-2 left-2 z-30 text-[11px] bg-white/90 border border-stone-200 rounded-md px-2 py-1 text-stone-500 shadow-sm"
      />

      {/* Legend */}
      <div className="absolute bottom-2 right-2 z-30 hidden md:block bg-white/90 backdrop-blur rounded-lg border border-stone-200 px-3 py-2 shadow-sm max-w-[260px]">
        <p className="text-[11px] font-bold text-stone-600 mb-1">מקרא</p>
        <div className="flex flex-wrap gap-x-2.5 gap-y-1 mb-1.5">
          {PERIOD_ORDER.map((key) => (
            <span key={key} className="flex items-center gap-1 text-[10px] text-stone-500">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: PERIOD_COLORS[key] }}
              />
              {PERIODS[key].label}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-stone-400 leading-relaxed">
          כל מלבן = חכם על פי שנות חייו; שורות מקבילות מונעות חפיפה. גלילה אנכית לעוד שורות ·
          Ctrl+גלגלת לזום · גרירה להזזה · לחיצה על קטע תקופה בסרגל העליון להתמקדות.
        </p>
      </div>

      {/* Scroll container — LTR for consistent scrollLeft semantics */}
      <div
        ref={scrollRef}
        dir="ltr"
        className="absolute inset-0 overflow-auto"
        style={{ touchAction: 'none', cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onScroll={() => {
          setHoveredItem(null);
          updateRangeChip();
        }}
      >
        <div style={{ width: L, height: RULER_H + totalH }}>
          {/* ── Sticky ruler ── */}
          <svg
            viewBox={`0 0 ${L} ${RULER_H}`}
            width={L}
            height={RULER_H}
            className="sticky top-0 z-10 block"
          >
            <rect x={0} y={0} width={L} height={RULER_H} fill="#FAFAF9" />

            {/* Period segments (click to focus) */}
            {ERA_SEGMENTS.map((seg) => {
              const x1 = yearToX(seg.start);
              const x2 = yearToX(seg.end);
              const w = x2 - x1;
              return (
                <g
                  key={seg.key}
                  className="cursor-pointer"
                  onClick={() => zoomToRange(seg.start - 6, seg.end + 6)}
                >
                  <rect
                    x={x1}
                    y={SEG_BAR_Y}
                    width={w}
                    height={SEG_BAR_H}
                    rx={4}
                    fill={seg.color}
                    opacity={0.88}
                  />
                  {w > 52 && (
                    <text
                      x={(x1 + x2) / 2}
                      y={SEG_BAR_Y + SEG_BAR_H / 2 + 0.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={10.5}
                      fontWeight={700}
                      fill="white"
                      fontFamily={FONT}
                      className="pointer-events-none"
                    >
                      {seg.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Minor ticks — every 25 years */}
            {minorTicks.map((y) => (
              <line
                key={`m${y}`}
                x1={yearToX(y)}
                y1={TICK_LINE_Y - 5}
                x2={yearToX(y)}
                y2={TICK_LINE_Y}
                stroke="#A8A29E"
                strokeWidth={0.6}
              />
            ))}

            {/* Labeled ticks — adaptive density */}
            {labeledTicks.map((y) => (
              <g key={`L${y}`}>
                <line
                  x1={yearToX(y)}
                  y1={TICK_LINE_Y - 9}
                  x2={yearToX(y)}
                  y2={TICK_LINE_Y}
                  stroke="#78716C"
                  strokeWidth={1}
                />
                <text
                  x={yearToX(y)}
                  y={TICK_LABEL_Y}
                  textAnchor="middle"
                  fontSize={y % 100 === 0 ? 10 : 8.5}
                  fontWeight={y % 100 === 0 ? 700 : 400}
                  fill={y % 100 === 0 ? '#57534E' : '#A8A29E'}
                  fontFamily={FONT}
                >
                  {formatYear(y)}
                </text>
              </g>
            ))}

            {/* Ruler baseline */}
            <line x1={0} y1={TICK_LINE_Y} x2={L} y2={TICK_LINE_Y} stroke="#D6D3D1" strokeWidth={1.5} />
            <line x1={0} y1={RULER_H - 0.5} x2={L} y2={RULER_H - 0.5} stroke="#E7E5E4" strokeWidth={1} />
          </svg>

          {/* ── Content ── */}
          <svg viewBox={`0 0 ${L} ${totalH}`} width={L} height={totalH} className="block">
            <rect x={0} y={0} width={L} height={totalH} fill="#FAFAF9" />

            {/* Era background bands */}
            {ERA_SEGMENTS.map((seg) => {
              const x1 = yearToX(seg.start);
              const x2 = yearToX(seg.end);
              return (
                <rect
                  key={`band-${seg.key}`}
                  x={x1}
                  y={0}
                  width={x2 - x1}
                  height={totalH}
                  fill={seg.color}
                  opacity={0.045}
                />
              );
            })}

            {/* Era boundary lines */}
            {ERA_SEGMENTS.slice(1).map((seg) => (
              <line
                key={`bound-${seg.key}`}
                x1={yearToX(seg.start)}
                y1={0}
                x2={yearToX(seg.start)}
                y2={totalH}
                stroke={seg.color}
                strokeWidth={0.75}
                strokeDasharray="4,4"
                opacity={0.3}
              />
            ))}

            {/* Vertical gridlines at labeled ticks */}
            {labeledTicks.map((y) => (
              <line
                key={`g${y}`}
                x1={yearToX(y)}
                y1={0}
                x2={yearToX(y)}
                y2={totalH}
                stroke="#78716C"
                strokeWidth={0.5}
                opacity={0.07}
              />
            ))}

            {/* ── Events section ── */}
            <text
              x={L - 8}
              y={16}
              textAnchor="end"
              fontSize={11}
              fontWeight={700}
              fill="#78716C"
              fontFamily={FONT}
            >
              אירועים היסטוריים
            </text>
            <line x1={PAD_L} y1={EVENT_LANE_Y} x2={L - PAD_R} y2={EVENT_LANE_Y} stroke="#E7E5E4" strokeWidth={1} />
            {timelineEvents.map((evt, i) => {
              const x = yearToX(evt.dateStart!);
              const color = EVENT_CATEGORY_COLORS[evt.category || ''] || '#6B7280';
              const above = i % 2 === 0;
              return (
                <g key={`event-${evt.id}`}>
                  <polygon
                    points={`${x},${EVENT_LANE_Y - 5} ${x - 4.5},${EVENT_LANE_Y} ${x},${EVENT_LANE_Y + 5} ${x + 4.5},${EVENT_LANE_Y}`}
                    fill={color}
                    opacity={0.8}
                    className="cursor-pointer hover:opacity-100"
                    onClick={() => {
                      if (draggedRef.current) return;
                      if (evt.description) {
                        alert(
                          `${evt.titleHe}\n\n${evt.description}${evt.place ? `\nמיקום: ${evt.place.nameHe}` : ''}`
                        );
                      }
                    }}
                    onMouseEnter={() => setHoveredItem({ type: 'event', id: evt.id, x, y: EVENT_LANE_Y })}
                    onMouseLeave={() => setHoveredItem(null)}
                  />
                  <text
                    x={x}
                    y={above ? EVENT_LANE_Y - 10 : EVENT_LANE_Y + 18}
                    textAnchor="middle"
                    fontSize={9}
                    fill={color}
                    fontFamily={FONT}
                    className="pointer-events-none"
                  >
                    {evt.titleHe}
                  </text>
                </g>
              );
            })}

            {/* ── Scholars section ── */}
            <line x1={0} y1={EVENTS_SECTION_H} x2={L} y2={EVENTS_SECTION_H} stroke="#E7E5E4" strokeWidth={1} />
            <text
              x={L - 8}
              y={SCHOLAR_HEADER_Y}
              textAnchor="end"
              fontSize={11}
              fontWeight={700}
              fill="#78716C"
              fontFamily={FONT}
            >
              חכמים — מסודרים לפי שנות חיים ({filteredScholars.length} מוצגים
              {undatedCount > 0 ? ` · ${undatedCount} ללא תאריכים אינם מוצגים` : ''})
            </text>

            {/* Zebra row striping — separates the parallel lanes visually */}
            {Array.from({ length: rowCount }, (_, r) =>
              r % 2 === 0 ? (
                <rect
                  key={`zebra-${r}`}
                  x={0}
                  y={ROWS_TOP + r * ROW_HEIGHT}
                  width={L}
                  height={ROW_HEIGHT}
                  fill="#1c1917"
                  opacity={0.025}
                />
              ) : null
            )}

            {/* Scholars */}
            {scholarRows.map(({ scholar, x, row, width }) => {
              const color = PERIOD_COLORS[scholar.period] || '#6B7280';
              const y = ROWS_TOP + row * ROW_HEIGHT;
              const midYear = getMidYear(scholar);
              const hasRange = scholar.birthStart != null && scholar.deathEnd != null;
              const uncertain =
                scholar.dateConfidence === 'DISPUTED' ||
                scholar.dateConfidence === 'UNKNOWN' ||
                scholar.dateConfidence === 'TRADITIONAL';

              return (
                <g
                  key={scholar.id}
                  className="cursor-pointer"
                  onClick={() => {
                    if (draggedRef.current) return;
                    router.push(`/scholars/${scholar.slug}`);
                  }}
                  onMouseEnter={() =>
                    midYear != null &&
                    setHoveredItem({ type: 'scholar', id: scholar.id, x: yearToX(midYear), y })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Lifespan range bar */}
                  {hasRange && (
                    <line
                      x1={yearToX(scholar.birthStart!)}
                      y1={y + ROW_HEIGHT / 2}
                      x2={yearToX(scholar.deathEnd!)}
                      y2={y + ROW_HEIGHT / 2}
                      stroke={color}
                      strokeWidth={5}
                      strokeLinecap="round"
                      opacity={uncertain ? 0.3 : 0.16}
                    />
                  )}

                  {/* Name box */}
                  <rect
                    x={x}
                    y={y + 2}
                    width={width}
                    height={ROW_HEIGHT - 4}
                    rx={6}
                    fill="white"
                    stroke={color}
                    strokeWidth={1.4}
                    className="hover:opacity-85"
                  />
                  <text
                    x={x + width / 2}
                    y={y + ROW_HEIGHT / 2 + 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fill="#1F2937"
                    fontFamily={FONT}
                    className="pointer-events-none"
                  >
                    {scholar.nameHe}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredItem && hoverScreenPos && (
        <div
          className="absolute z-40 bg-white border border-stone-200 rounded-lg shadow-lg p-2 text-xs max-w-[220px] pointer-events-none"
          style={{ left: hoverScreenPos.left, top: hoverScreenPos.top }}
        >
          {hoveredItem.type === 'scholar' && scholarForHover && (
            <div>
              <p className="font-bold text-stone-800">{scholarForHover.nameHe}</p>
              {scholarForHover.role && <p className="text-stone-500">{scholarForHover.role}</p>}
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
