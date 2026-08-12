'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { PERIODS, PERIOD_ORDER, RELATIONSHIP_TYPES } from '@/lib/constants';

// ── Color mapping ──
const PERIOD_COLORS: Record<string, string> = {
  ANSHEI_KNESSET: '#5f7d54', // olive
  ZUGOT: '#3d5a8a', // indigo
  TANNAIM: '#a8792c', // ochre
  AMORAIM_ERETZ_YISRAEL: '#b0603a', // terracotta
  AMORAIM_BAVEL: '#9e3b3b', // madder
  SAVORAIM: '#4b5266', // ink-slate
};

const PERIOD_COLORS_BG: Record<string, string> = {
  ANSHEI_KNESSET: '#e9efe3',
  ZUGOT: '#e6ebf4',
  TANNAIM: '#f3ead3',
  AMORAIM_ERETZ_YISRAEL: '#f4e5db',
  AMORAIM_BAVEL: '#f2e0df',
  SAVORAIM: '#e7e9ef',
};

// ── Relationship line styles ──
const RELATIONSHIP_STYLES: Record<string, { dash: string; width: number; color: string }> = {
  RAV: { dash: 'solid', width: 2.5, color: '#0f6b63' },
  STUDENT: { dash: 'solid', width: 2.5, color: '#0f6b63' },
  CHEVRUTA: { dash: 'dashed', width: 2, color: '#9c7c4a' },
  DISPUTANT: { dash: 'dotted', width: 2, color: '#a23b3b' },
  CONTEMPORARY: { dash: 'solid', width: 1, color: '#9ca39a' },
  FAMILY: { dash: 'dashed', width: 2, color: '#5f7d54' },
};

interface GraphNode {
  id: string;
  label: string;
  slug: string;
  period: string;
  role: string | null;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: string;
}

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function GraphView({ nodes, edges }: GraphViewProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<'cose' | 'breadthfirst' | 'grid'>('cose');
  const [showLegend, setShowLegend] = useState(true);

  // Build Cytoscape elements
  const elements = useMemo(() => {
    const cyNodes = nodes.map((n) => ({
      data: {
        id: n.id,
        label: n.label,
        slug: n.slug,
        period: n.period,
        role: n.role || '',
      },
    }));

    const cyEdges = edges.map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        confidence: e.confidence,
      },
    }));

    return [...cyNodes, ...cyEdges];
  }, [nodes, edges]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return;

    // Clean up previous instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // ── Node style ──
        {
          selector: 'node',
          style: {
            'background-color': (el: cytoscape.NodeSingular) => {
              const period = el.data('period');
              return PERIOD_COLORS_BG[period] || '#F3F4F6';
            },
            'border-color': (el: cytoscape.NodeSingular) => {
              const period = el.data('period');
              return PERIOD_COLORS[period] || '#9CA3AF';
            },
            'border-width': 2,
            'border-opacity': 0.8,
            'label': 'data(label)',
            'font-size': '12px',
            'font-family': 'var(--font-heebo), Heebo, sans-serif',
            'color': '#1F2937',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'width': 28,
            'height': 28,
            'shape': 'ellipse',
            'transition-property': 'width, height, border-width',
            'transition-duration': 200,
          },
        },
        // ── Hover highlight ──
        {
          selector: 'node.hovered',
          style: {
            'width': 40,
            'height': 40,
            'border-width': 4,
            'z-index': 10,
          },
        },
        // ── Selected node ──
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#1F2937',
            'z-index': 10,
          },
        },
        // ── Edge style ──
        {
          selector: 'edge',
          style: {
            'width': (el: cytoscape.EdgeSingular) => {
              const type = el.data('type') as string;
              return RELATIONSHIP_STYLES[type]?.width ?? 1.5;
            },
            'line-color': (el: cytoscape.EdgeSingular) => {
              const type = el.data('type') as string;
              return RELATIONSHIP_STYLES[type]?.color ?? '#9CA3AF';
            },
            'line-style': (el: cytoscape.EdgeSingular) => {
              const type = el.data('type') as string;
              const dash = RELATIONSHIP_STYLES[type]?.dash;
              return (dash ?? 'solid') as cytoscape.Css.LineStyle;
            },
            'target-arrow-color': (el: cytoscape.EdgeSingular) => {
              const type = el.data('type') as string;
              return RELATIONSHIP_STYLES[type]?.color ?? '#9CA3AF';
            },
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.5,
          },
        },
        // ── Edge hover ──
        {
          selector: 'edge.hovered',
          style: {
            'opacity': 0.9,
            'width': 4,
            'z-index': 5,
          },
        },
        // ── Search highlight ──
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 5,
            'border-color': '#F59E0B',
            'width': 42,
            'height': 42,
            'z-index': 20,
          },
        },
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.2,
          },
        },
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.05,
          },
        },
      ],
      layout: {
        name: layout,
        ...(layout === 'breadthfirst'
          ? {
              directed: true,
              spacingFactor: 1.2,
              avoidOverlap: true,
            }
          : {}),
        ...(layout === 'grid'
          ? {
              rows: Math.ceil(Math.sqrt(nodes.length)),
              avoidOverlap: true,
            }
          : {}),
        ...(layout === 'cose'
          ? {
              nodeRepulsion: () => 8000,
              idealEdgeLength: () => 120,
              gravity: 0.25,
              numIter: 2000,
              initialTemp: 200,
            }
          : {}),
      },
      wheelSensitivity: 0.3,
      minZoom: 0.1,
      maxZoom: 3,
    });

    // ── Click handler ──
    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      const slug = node.data('slug');
      if (slug) {
        router.push(`/scholars/${slug}`);
      }
    });

    // ── Hover highlight (nodes + edges) ──
    cy.on('mouseover', 'node', (evt: EventObject) => {
      evt.target.addClass('hovered');
    });
    cy.on('mouseout', 'node', (evt: EventObject) => {
      evt.target.removeClass('hovered');
    });

    // ── Tooltip on edge hover (via popper-style) ──
    cy.on('mouseover', 'edge', (evt: EventObject) => {
      const edge = evt.target;
      edge.addClass('hovered');
      const type = edge.data('type') as string;
      const typeLabel = RELATIONSHIP_TYPES[type as keyof typeof RELATIONSHIP_TYPES] || type;
      const container = containerRef.current;
      if (!container) return;

      // Simple tooltip via title
      const sourceNode = cy.getElementById(edge.data('source'));
      const targetNode = cy.getElementById(edge.data('target'));
      const sourceLabel = sourceNode.data('label') || '';
      const targetLabel = targetNode.data('label') || '';
      container.title = `${sourceLabel} → ${targetLabel} (${typeLabel})`;
    });

    cy.on('mouseout', 'edge', (evt: EventObject) => {
      evt.target.removeClass('hovered');
      if (containerRef.current) {
        containerRef.current.title = '';
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [elements, layout, router]);

  // Relayout when layout changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const layoutOptions: any = {
      name: layout,
      animate: true,
      animationDuration: 500,
    };

    if (layout === 'breadthfirst') {
      layoutOptions.directed = true;
      layoutOptions.spacingFactor = 1.2;
      layoutOptions.avoidOverlap = true;
    }
    if (layout === 'grid') {
      layoutOptions.rows = Math.ceil(Math.sqrt(nodes.length));
      layoutOptions.avoidOverlap = true;
    }
    if (layout === 'cose') {
      layoutOptions.nodeRepulsion = () => 8000;
      layoutOptions.idealEdgeLength = () => 120;
      layoutOptions.gravity = 0.25;
      layoutOptions.numIter = 2000;
    }

    const runLayout = cy.layout(layoutOptions);
    runLayout.run();
  }, [layout, nodes.length]);

  // Search/filter handler
  const handleSearch = useCallback(
    (query: string) => {
      setSearch(query);
      const cy = cyRef.current;
      if (!cy) return;

      cy.nodes().removeClass('highlighted dimmed');
      cy.edges().removeClass('dimmed');

      if (!query.trim()) return;

      const q = query.trim().toLowerCase();
      const matchingNodes = cy.nodes().filter((n) => {
        const label = (n.data('label') || '').toLowerCase();
        const role = (n.data('role') || '').toLowerCase();
        return label.includes(q) || role.includes(q);
      });

      matchingNodes.addClass('highlighted');

      // Dim all non-matching nodes and their edges
      const nonMatching = cy.nodes().not(matchingNodes);
      nonMatching.addClass('dimmed');

      // Dim edges not connected to matching nodes
      cy.edges().forEach((e) => {
        if (!matchingNodes.has(e.source()) && !matchingNodes.has(e.target())) {
          e.addClass('dimmed');
        }
      });

      // Fit to matching
      if (matchingNodes.length > 0) {
        cy.animate({
          fit: { eles: matchingNodes, padding: 60 },
          duration: 400,
        });
      }
    },
    []
  );

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() / 1.2);
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleReset = () => {
    const cy = cyRef.current;
    if (!cy) return;
    setSearch('');
    cy.nodes().removeClass('highlighted dimmed');
    cy.edges().removeClass('dimmed');
    cy.fit(undefined, 40);
  };

  return (
    <div className="flex-1 relative flex" dir="rtl">
      {/* Graph container */}
      <div
        ref={containerRef}
        className="flex-1 bg-stone-50"
        style={{ minHeight: 0 }}
      />

      {/* Controls overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors shadow-sm"
          title="הגדל"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors shadow-sm"
          title="הקטן"
        >
          −
        </button>
        <button
          onClick={handleFit}
          className="w-9 h-9 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors shadow-sm"
          title="התאם למסך"
        >
          ⊡
        </button>
        <button
          onClick={handleReset}
          className="w-9 h-9 bg-white border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors shadow-sm"
          title="אפס"
        >
          ↺
        </button>
      </div>

      {/* Search bar */}
      <div className="absolute top-3 right-3 z-20 w-64">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="🔍 חפש חכם..."
          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 shadow-sm"
          dir="rtl"
        />
      </div>

      {/* Layout selector */}
      <div className="absolute bottom-20 right-3 z-20 flex gap-1 bg-white/90 backdrop-blur rounded-lg border border-stone-200 p-1 shadow-sm">
        {(['cose', 'breadthfirst', 'grid'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLayout(l)}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
              layout === l
                ? 'bg-stone-800 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {l === 'cose' ? 'כוח' : l === 'breadthfirst' ? 'היררכי' : 'רשת'}
          </button>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur rounded-lg border border-stone-200 p-3 shadow-sm max-w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-700">מקרא</span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-stone-500 mb-1">תקופות:</p>
            {PERIOD_ORDER.map((key) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full shrink-0 border"
                  style={{
                    backgroundColor: PERIOD_COLORS_BG[key],
                    borderColor: PERIOD_COLORS[key],
                  }}
                />
                <span className="text-stone-700 leading-tight">{PERIODS[key].label}</span>
              </div>
            ))}
            <div className="border-t border-stone-100 my-1.5" />
            <p className="text-[10px] text-stone-500 mb-1">קשרים:</p>
            {(Object.keys(RELATIONSHIP_TYPES) as Array<keyof typeof RELATIONSHIP_TYPES>).map(
              (key) => {
                const style = RELATIONSHIP_STYLES[key];
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <svg width="20" height="12" className="shrink-0">
                      <line
                        x1="2"
                        y1="6"
                        x2="18"
                        y2="6"
                        stroke={style.color}
                        strokeWidth={style.width}
                        strokeDasharray={
                          style.dash === 'dashed'
                            ? '4,2'
                            : style.dash === 'dotted'
                            ? '2,2'
                            : 'none'
                        }
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                    <span className="text-stone-700 leading-tight">
                      {RELATIONSHIP_TYPES[key]}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Hidden legend toggle when closed */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-3 left-3 z-20 bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-600 hover:bg-stone-100 shadow-sm"
        >
          📖 מקרא
        </button>
      )}

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-stone-400 pointer-events-none">
          <div className="text-center">
            <div className="text-4xl mb-3">🕸️</div>
            <p className="text-lg">אין נתוני גרף זמינים</p>
            <p className="text-sm mt-1">יש להוסיף חכמים וקשרים למערכת</p>
          </div>
        </div>
      )}

      {/* SVG defs for legend arrows */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="6"
            markerHeight="5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#0f6b63" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
