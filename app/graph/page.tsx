import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { prisma } from '@/lib/prisma';
import { GraphView } from './GraphView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'גרף קשרים',
  description: 'גרף קשרים אינטראקטיבי — רב-תלמיד, חברותא ובר פלוגתא בין חכמי המשנה והתלמוד',
};

async function getGraphData() {
  const [scholars, relationships] = await Promise.all([
    prisma.scholar.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        nameHe: true,
        period: true,
        role: true,
        generationId: true,
      },
      orderBy: { period: 'asc' },
    }),
    prisma.relationship.findMany({
      select: {
        id: true,
        fromScholarId: true,
        toScholarId: true,
        type: true,
        confidence: true,
      },
    }),
  ]);

  const publishedIds = new Set(scholars.map((s) => s.id));
  const filteredRelationships = relationships.filter(
    (r) => publishedIds.has(r.fromScholarId) && publishedIds.has(r.toScholarId)
  );

  return { scholars, relationships: filteredRelationships };
}

export default async function GraphPage() {
  const { scholars, relationships } = await getGraphData();

  const nodes = scholars.map((s) => ({
    id: s.id,
    label: s.nameHe,
    slug: s.slug,
    period: s.period,
    role: s.role,
  }));

  const edges = relationships.map((r) => ({
    id: r.id,
    source: r.fromScholarId,
    target: r.toScholarId,
    type: r.type,
    confidence: r.confidence,
  }));

  return (
    <>
      <Header />
      <main className="flex flex-col h-[calc(100vh-57px)]">
        <div className="shrink-0 px-4 py-4 border-b border-stone-200 bg-white">
          <h1 className="font-display text-2xl text-stone-800">גרף קשרים</h1>
          <p className="text-sm text-stone-500">קשרי רב-תלמיד, חברותא ובר פלוגתא — {nodes.length} חכמים, {edges.length} קשרים</p>
        </div>
        <GraphView nodes={nodes} edges={edges} />
      </main>
    </>
  );
}
