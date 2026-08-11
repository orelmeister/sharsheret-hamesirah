import { Header } from '@/components/layout/Header';

export default function TimelinePage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-stone-800 mb-2">ציר זמן</h1>
        <p className="text-stone-500 mb-8">מאנשי כנסת הגדולה ועד חתימת התלמוד</p>
        <div className="scholar-card min-h-[400px] flex items-center justify-center text-stone-400">
          <div className="text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-lg">ציר זמן אינטראקטיבי — בקרוב</p>
            <p className="text-sm mt-1">Phase 3</p>
          </div>
        </div>
      </main>
    </>
  );
}
