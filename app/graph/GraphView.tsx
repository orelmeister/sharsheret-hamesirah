'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { PERIODS, PERIOD_ORDER, RELATIONSHIP_TYPES } from '@/lib/constants';

const PERIOD_COLORS: Record<string, string> = {
  ANSHEI_KNESSET: '#5f7d54',
  ZUGOT: '#3d5a8a',
  TANNAIM: '#a8792c',
  AMORAIM_ERETZ_YISRAEL: '#b0603a',
  AMORAIM_BAVEL: '#9e3b3b',
  SAVORAIM: '#4b5266',
};
const PERIOD_COLORS_BG: Record<string, string> = {
  ANSHEI_KNESSET: '#e9efe3',
  ZUGOT: '#e6ebf4',
  TANNAIM: '#f3ead3',
  AMORAIM_ERETZ_YISRAEL: '#f4e5db',
  AMORAIM_BAVEL: '#f2e0df',
  SAVORAIM: '#e7e9ef',
};
const RELATIONSHIP_STYLES: Record<string, { dash: string; width: number; color: string }> = {
  RAV: { dash: 'solid', width: 2.5, color: '#0f6b63' },
  STUDENT: { dash: 'solid', width: 2.5, color: '#0f6b63' },
  CHEVRUTA: { dash: 'dashed', width: 2, color: '#9c7c4a' },
  DISPUTANT: { dash: 'dotted', width: 2, color: '#a23b3b' },
  CONTEMPORARY: { dash: 'solid', width: 1, color: '#9ca39a' },
  FAMILY: { dash: 'dashed', width: 2, color: '#5f7d54' },
};

interface GraphNode { id: string; label: string; slug: string; period: string; role: string | null; }
interface GraphEdge { id: string; source: string; target: string; type: string; confidence: string; }
interface GraphViewProps { nodes: GraphNode[]; edges: GraphEdge[]; }

export function GraphView({ nodes, edges }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<'cose' | 'breadthfirst' | 'grid'>('cose');
  const [showLegend, setShowLegend] = useState(false);
  const [showIsolated, setShowIsolated] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);

  // Which nodes have at least one edge
  const degree = useMemo(() => {
    const d = new Map<string, number>();
    for (const e of edges) { d.set(e.source, (d.get(e.source) || 0) + 1); d.set(e.target, (d.get(e.target) || 0) + 1); }
    return d;
  }, [edges]);

  const isolatedCount = useMemo(() => nodes.filter((n) => !degree.get(n.id)).length, [nodes, degree]);

  // Visible node set based on filters
  const visibleNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (!showIsolated && !degree.get(n.id)) return false;
      if (periodFilter && n.period !== periodFilter) return false;
      return true;
    });
  }, [nodes, degree, showIsolated, periodFilter]);

  const elements = useMemo(() => {
    const vis = new Set(visibleNodes.map((n) => n.id));
    const cyNodes = visibleNodes.map((n) => ({
      data: { id: n.id, label: n.label, slug: n.slug, period: n.period, role: n.role || '' },
    }));
    const cyEdges = edges
      .filter((e) => vis.has(e.source) && vis.has(e.target))
      .map((e) => ({ data: { id: e.id, source: e.source, target: e.target, type: e.type, confidence: e.confidence } }));
    return [...cyNodes, ...cyEdges];
  }, [visibleNodes, edges]);

  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return;
    if (cyRef.current) cyRef.current.destroy();

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (el: cytoscape.NodeSingular) => PERIOD_COLORS_BG[el.data('period')] || '#eee',
            'border-color': (el: cytoscape.NodeSingular) => PERIOD_COLORS[el.data('period')] || '#999',
            'border-width': 2,
            'label': 'data(label)',
            'font-size': '11px',
            'font-family': 'var(--font-heebo), Assistant, sans-serif',
            'color': '#211d18',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 5,
            'text-wrap': 'wrap',
            'text-max-width': '90px',
            'width': 26,
            'height': 26,
            'transition-property': 'width, height, border-width, opacity',
            'transition-duration': 150,
          },
        },
        { selector: 'node.hovered', style: { 'width': 38, 'height': 38, 'border-width': 4, 'z-index': 10 } },
        { selector: 'node.focused', style: { 'border-width': 5, 'border-color': '#0f6b63', 'width': 42, 'height': 42, 'z-index': 20 } },
        { selector: 'node.neighbor', style: { 'border-width': 3, 'z-index': 12 } },
        { selector: 'node.dimmed', style: { 'opacity': 0.12 } },
        { selector: 'node.highlighted', style: { 'border-width': 5, 'border-color': '#0f6b63', 'width': 42, 'height': 42, 'z-index': 20 } },
        {
          selector: 'edge',
          style: {
            'width': (el: cytoscape.EdgeSingular) => RELATIONSHIP_STYLES[el.data('type') as string]?.width ?? 1.5,
            'line-color': (el: cytoscape.EdgeSingular) => RELATIONSHIP_STYLES[el.data('type') as string]?.color ?? '#9ca39a',
            'line-style': (el: cytoscape.EdgeSingular) => (RELATIONSHIP_STYLES[el.data('type') as string]?.dash ?? 'solid') as cytoscape.Css.LineStyle,
            'target-arrow-color': (el: cytoscape.EdgeSingular) => RELATIONSHIP_STYLES[el.data('type') as string]?.color ?? '#9ca39a',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.8,
            'curve-style': 'bezier',
            'opacity': 0.45,
          },
        },
        { selector: 'edge.dimmed', style: { 'opacity': 0.04 } },
        { selector: 'edge.neighbor', style: { 'opacity': 0.85, 'width': 3.5 } },
      ],
      layout: layoutOpts(layout, visibleNodes.length),
      minZoom: 0.08,
      maxZoom: 3,
    });

    // Frame the graph once layout settles
    cy.one('layoutstop', () => cy.fit(undefined, 50));
    // Fallback fit in case layoutstop doesn't fire
    setTimeout(() => { try { cy.fit(undefined, 50); } catch { /* noop */ } }, 800);

    const clearFocus = () => {
      cy.elements().removeClass('dimmed neighbor focused hovered highlighted');
      setSelected(null);
    };

    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      cy.elements().removeClass('dimmed neighbor focused highlighted');
      const neighborhood = node.closedNeighborhood();
      cy.elements().not(neighborhood).addClass('dimmed');
      neighborhood.nodes().addClass('neighbor');
      neighborhood.edges().addClass('neighbor');
      node.addClass('focused');
      setSelected({ id: node.id(), label: node.data('label'), slug: node.data('slug'), period: node.data('period'), role: node.data('role') || null });
    });
    cy.on('tap', (evt: EventObject) => { if (evt.target === cy) clearFocus(); });
    cy.on('mouseover', 'node', (evt: EventObject) => evt.target.addClass('hovered'));
    cy.on('mouseout', 'node', (evt: EventObject) => evt.target.removeClass('hovered'));

    cyRef.current = cy;
    return () => { cy.destroy(); cyRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, layout]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass('highlighted dimmed');
    cy.edges().removeClass('dimmed');
    if (!query.trim()) return;
    const q = query.trim().toLowerCase();
    const match = cy.nodes().filter((n) => (n.data('label') || '').toLowerCase().includes(q));
    match.addClass('highlighted');
    cy.nodes().not(match).addClass('dimmed');
    cy.edges().forEach((e) => { if (!match.has(e.source()) && !match.has(e.target())) e.addClass('dimmed'); });
    if (match.length > 0) cy.animate({ fit: { eles: match, padding: 80 }, duration: 350 });
  }, []);

  const zoomBy = (f: number) => cyRef.current?.zoom({ level: (cyRef.current.zoom() || 1) * f, renderedPosition: { x: (containerRef.current?.clientWidth || 0) / 2, y: (containerRef.current?.clientHeight || 0) / 2 } });
  const fit = () => cyRef.current?.fit(undefined, 40);

  return (
    <div className="flex-1 relative flex" dir="rtl">
      <div ref={containerRef} className="flex-1 bg-parchment" style={{ minHeight: 0 }} />

      {/* Top controls bar */}
      <div className="absolute top-2 inset-x-2 z-20 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="🔍 חפש חכם..."
          className="flex-1 min-w-[140px] max-w-xs px-3 py-2 bg-surface border border-line rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent shadow-card"
        />
        <div className="flex gap-1 bg-surface/95 rounded-lg border border-line p-1 shadow-card">
          {(['cose', 'breadthfirst', 'grid'] as const).map((l) => (
            <button key={l} onClick={() => setLayout(l)} className={`px-2.5 py-1 rounded-md text-xs transition-colors ${layout === l ? 'bg-accent text-white' : 'text-ink-soft hover:bg-parchment-dark'}`}>
              {l === 'cose' ? 'כוח' : l === 'breadthfirst' ? 'היררכי' : 'רשת'}
            </button>
          ))}
        </div>
      </div>

      {/* Period filter chips */}
      <div className="absolute top-14 inset-x-2 z-20 flex flex-wrap gap-1">
        <button onClick={() => setPeriodFilter(null)} className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${!periodFilter ? 'bg-ink text-white border-ink' : 'bg-surface/90 text-ink-soft border-line hover:bg-parchment-dark'}`}>הכל</button>
        {PERIOD_ORDER.map((k) => (
          <button key={k} onClick={() => setPeriodFilter(periodFilter === k ? null : k)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${periodFilter === k ? 'text-white' : 'bg-surface/90 hover:bg-parchment-dark'}`}
            style={periodFilter === k ? { backgroundColor: PERIOD_COLORS[k], borderColor: PERIOD_COLORS[k] } : { borderColor: PERIOD_COLORS[k], color: PERIOD_COLORS[k] }}>
            {PERIODS[k].label}
          </button>
        ))}
      </div>

      {/* Zoom + isolated toggle (bottom-start) */}
      <div className="absolute bottom-3 start-3 z-20 flex flex-col gap-1.5">
        <button onClick={() => zoomBy(1.25)} className="w-9 h-9 bg-surface border border-line rounded-lg flex items-center justify-center text-ink hover:bg-parchment-dark shadow-card">+</button>
        <button onClick={() => zoomBy(0.8)} className="w-9 h-9 bg-surface border border-line rounded-lg flex items-center justify-center text-ink hover:bg-parchment-dark shadow-card">−</button>
        <button onClick={fit} className="w-9 h-9 bg-surface border border-line rounded-lg flex items-center justify-center text-ink hover:bg-parchment-dark shadow-card" title="התאם למסך">⊡</button>
      </div>

      {/* Isolated toggle + legend button (bottom-end) */}
      <div className="absolute bottom-3 end-3 z-20 flex flex-col items-end gap-2">
        {isolatedCount > 0 && (
          <button onClick={() => setShowIsolated((v) => !v)} className={`px-3 py-1.5 rounded-lg text-xs border shadow-card transition-colors ${showIsolated ? 'bg-accent text-white border-accent' : 'bg-surface text-ink-soft border-line hover:bg-parchment-dark'}`}>
            {showIsolated ? 'הסתר' : 'הצג'} חכמים ללא קשרים ({isolatedCount})
          </button>
        )}
        <button onClick={() => setShowLegend((v) => !v)} className="px-3 py-1.5 rounded-lg text-xs bg-surface border border-line text-ink-soft hover:bg-parchment-dark shadow-card">
          {showLegend ? 'סגור מקרא' : '📖 מקרא'}
        </button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-16 end-3 z-30 bg-surface/97 backdrop-blur rounded-xl border border-line p-3 shadow-card-hover max-w-[230px]">
          <p className="text-[11px] text-ink-muted mb-1.5 font-semibold">תקופות</p>
          {PERIOD_ORDER.map((k) => (
            <div key={k} className="flex items-center gap-2 text-xs mb-1">
              <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: PERIOD_COLORS_BG[k], borderColor: PERIOD_COLORS[k] }} />
              <span className="text-ink-soft">{PERIODS[k].label}</span>
            </div>
          ))}
          <div className="border-t border-line my-2" />
          <p className="text-[11px] text-ink-muted mb-1.5 font-semibold">קשרים</p>
          {(Object.keys(RELATIONSHIP_TYPES) as Array<keyof typeof RELATIONSHIP_TYPES>).map((k) => {
            const st = RELATIONSHIP_STYLES[k];
            return (
              <div key={k} className="flex items-center gap-2 text-xs mb-1">
                <svg width="22" height="10"><line x1="2" y1="5" x2="20" y2="5" stroke={st.color} strokeWidth={st.width} strokeDasharray={st.dash === 'dashed' ? '4,2' : st.dash === 'dotted' ? '2,2' : 'none'} /></svg>
                <span className="text-ink-soft">{RELATIONSHIP_TYPES[k]}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected scholar panel */}
      {selected && (
        <div className="absolute top-24 start-3 z-30 bg-surface rounded-xl border border-line shadow-card-hover p-4 max-w-[240px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="period-badge text-[11px] mb-1" style={{ backgroundColor: PERIOD_COLORS_BG[selected.period], color: PERIOD_COLORS[selected.period], borderColor: PERIOD_COLORS[selected.period] }}>{PERIODS[selected.period as keyof typeof PERIODS]?.label}</p>
              <h3 className="font-display font-bold text-lg text-ink leading-tight">{selected.label}</h3>
              {selected.role && <p className="text-xs text-ink-muted mt-0.5">{selected.role}</p>}
            </div>
            <button onClick={() => { cyRef.current?.elements().removeClass('dimmed neighbor focused'); setSelected(null); }} className="text-ink-muted hover:text-ink text-sm">✕</button>
          </div>
          <Link href={`/scholars/${selected.slug}`} className="btn-accent w-full mt-3 py-2 text-sm">פתח דף חכם ←</Link>
        </div>
      )}

      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-ink-muted pointer-events-none">
          <div className="text-center">
            <div className="text-4xl mb-3">🕸️</div>
            <p className="text-lg">אין קשרים להצגה בתקופה זו</p>
          </div>
        </div>
      )}
    </div>
  );
}

function layoutOpts(layout: string, n: number): cytoscape.LayoutOptions {
  if (layout === 'breadthfirst') return { name: 'breadthfirst', directed: true, spacingFactor: 1.3, avoidOverlap: true, padding: 30 } as cytoscape.LayoutOptions;
  if (layout === 'grid') return { name: 'grid', rows: Math.ceil(Math.sqrt(n)), avoidOverlap: true, padding: 30 } as cytoscape.LayoutOptions;
  return {
    name: 'cose', animate: false, padding: 50, fit: true,
    nodeRepulsion: () => 14000, idealEdgeLength: () => 85, edgeElasticity: () => 130,
    gravity: 0.55, numIter: 1800, initialTemp: 220, coolingFactor: 0.95, nestingFactor: 1.1,
    componentSpacing: 45,
  } as unknown as cytoscape.LayoutOptions;
}
