import { Header } from '@/components/layout/Header';
import { SearchResults } from './SearchResults';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-stone-800 mb-6">חיפוש</h1>
        <form className="mb-8">
          <div className="relative">
            <input
              type="search"
              name="q"
              defaultValue={searchParams.q || ''}
              placeholder="חפש חכם, מקור, תקופה..."
              className="w-full px-6 py-4 text-lg rounded-xl border-2 border-stone-200 
                         focus:border-amber-400 focus:outline-none text-right
                         placeholder:text-stone-400"
            />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600
                         text-white px-6 py-2 rounded-lg transition-colors"
            >
              חפש
            </button>
          </div>
        </form>
        {searchParams.q && <SearchResults query={searchParams.q} />}
      </main>
    </>
  );
}
