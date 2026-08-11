import { Header } from '@/components/layout/Header';

export default function MapPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-stone-800 mb-2">מפה</h1>
        <p className="text-stone-500 mb-8">מקומות מרכזיים — ירושלים, יבנה, ציפורי, טבריה, סורא, פומבדיתא ועוד</p>
        <div className="scholar-card min-h-[500px] flex items-center justify-center text-stone-400">
          <div className="text-center">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-lg">מפה אינטראקטיבית — בקרוב</p>
            <p className="text-sm mt-1">Phase 3</p>
          </div>
        </div>
      </main>
    </>
  );
}
