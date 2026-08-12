import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ScholarAvatar } from '@/components/ScholarAvatar';
import { PERIODS, RELATIONSHIP_TYPES, CONFIDENCE_LEVELS } from '@/lib/constants';
import { formatYear, formatYearRange } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// A chip in the transmission chain. Internal link when we have the scholar,
// otherwise a Sefaria-attributed text chip.
function ChainChip({ person }: { person: { nameHe: string; slug: string | null; sefSlug?: string | null } }) {
  if (person.slug) {
    return (
      <Link href={`/scholars/${person.slug}`} className="inline-flex items-center px-3 py-1.5 bg-accent-soft hover:bg-accent hover:text-white text-accent-dark rounded-lg text-sm transition-colors">
        {person.nameHe}
      </Link>
    );
  }
  const inner = <span className="inline-flex items-center px-3 py-1.5 bg-parchment-dark text-ink-soft rounded-lg text-sm border border-line">{person.nameHe}</span>;
  if (person.sefSlug) {
    return (
      <a href={`https://www.sefaria.org/topics/${person.sefSlug}`} target="_blank" rel="noopener noreferrer" title="פתח בספריא" className="hover:opacity-80 transition-opacity">
        {inner}
      </a>
    );
  }
  return inner;
}

export default async function ScholarPage({ params }: { params: { slug: string } }) {
  const scholar = await prisma.scholar.findUnique({
    where: { slug: params.slug },
    include: {
      relationshipsFrom: {
        include: {
          toScholar: { select: { id: true, slug: true, nameHe: true, period: true } },
          source: { select: { id: true, titleHe: true, pageRef: true, url: true } },
        },
      },
      relationshipsTo: {
        include: {
          fromScholar: { select: { id: true, slug: true, nameHe: true, period: true } },
          source: { select: { id: true, titleHe: true, pageRef: true, url: true } },
        },
      },
      scholarSources: { include: { source: true } },
      scholarPlaces: { include: { place: true } },
      scholarEvents: { include: { event: true } },
      generation: true,
      empire: true,
    },
  });

  if (!scholar || scholar.status !== 'PUBLISHED') notFound();

  const period = PERIODS[scholar.period as keyof typeof PERIODS];
  const teachers = scholar.relationshipsTo.filter((r) => r.type === 'RAV');
  const students = scholar.relationshipsFrom.filter((r) => r.type === 'RAV');
  // Separate From and To to resolve TypeScript union types
  const chevrutot = [
    ...scholar.relationshipsFrom.filter((r) => r.type === 'CHEVRUTA').map((r) => ({ ...r, peer: r.toScholar })),
    ...scholar.relationshipsTo.filter((r) => r.type === 'CHEVRUTA').map((r) => ({ ...r, peer: r.fromScholar })),
  ];
  const disputants = [
    ...scholar.relationshipsFrom.filter((r) => r.type === 'DISPUTANT').map((r) => ({ ...r, peer: r.toScholar })),
    ...scholar.relationshipsTo.filter((r) => r.type === 'DISPUTANT').map((r) => ({ ...r, peer: r.fromScholar })),
  ];

  // Merge internal (relationship-graph) chain with Sefaria's teacher/student lists.
  type ChainPerson = { nameHe: string; slug: string | null; sefSlug?: string | null };
  type SefLink = { he: string; sefSlug?: string | null; ourSlug?: string | null };
  const normName = (s: string) => (s || '').replace(/[\s"'״׳()\[\]־,.:]/g, '');
  function mergeChain(internal: ChainPerson[], sefaria: SefLink[]): ChainPerson[] {
    const out: ChainPerson[] = [];
    const seen = new Set<string>();
    const add = (p: ChainPerson) => {
      const key = p.slug || normName(p.nameHe);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(p);
    };
    for (const p of internal) add(p);
    for (const s of sefaria || []) add({ nameHe: s.he, slug: s.ourSlug || null, sefSlug: s.sefSlug || null });
    return out;
  }
  const sefTeachers = (scholar.sefariaTeachers as unknown as SefLink[]) || [];
  const sefStudents = (scholar.sefariaStudents as unknown as SefLink[]) || [];
  const chainTeachers = mergeChain(
    teachers.map((r) => ({ nameHe: r.fromScholar.nameHe, slug: r.fromScholar.slug })),
    sefTeachers,
  );
  const chainStudents = mergeChain(
    students.map((r) => ({ nameHe: r.toScholar.nameHe, slug: r.toScholar.slug })),
    sefStudents,
  );
  const hasSefaria = sefTeachers.length > 0 || sefStudents.length > 0;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title Bar */}
        <div className={`border-r-4 pr-4 mb-8 ${period?.borderClass || 'border-line'}`}>
          <div className="flex items-start gap-4">
            <ScholarAvatar nameHe={scholar.nameHe} period={scholar.period} imageUrl={scholar.imageUrl} size={92} className="mt-1 md:w-[112px] md:h-[112px]" />
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`period-badge text-sm ${period?.bgClass}`}>{period?.label}</span>
                {scholar.role && (
                  <span className="text-ink-muted text-sm">{scholar.role}</span>
                )}
              </div>
              <h1 className="font-display font-bold text-4xl md:text-5xl text-ink mt-2">{scholar.nameHe}</h1>
              {scholar.alternateNames.length > 0 && (
                <p className="text-ink-muted mt-1">{scholar.alternateNames.join(' • ')}</p>
              )}
              {scholar.imageUrl && (
                <p className="text-[11px] text-ink-muted mt-1.5">
                  {scholar.imageType === 'ILLUSTRATION' ? 'איור — ' : ''}{scholar.imageCredit || 'ויקישיתוף'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Identity Card */}
            <section>
              <h2 className="section-title">תעודת זהות</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {scholar.generation && (
                  <>
                    <dt className="text-stone-500">דור</dt>
                    <dd>{scholar.generation.nameHe}</dd>
                  </>
                )}
                <dt className="text-stone-500">שנות חיים</dt>
                <dd>
                  {formatYearRange(scholar.birthStart, scholar.deathEnd)}
                  {scholar.dateConfidence !== 'UNKNOWN' && (
                    <span className="text-xs text-stone-400 mr-2">
                      ({CONFIDENCE_LEVELS[scholar.dateConfidence as keyof typeof CONFIDENCE_LEVELS]?.label})
                    </span>
                  )}
                </dd>
                {scholar.placeNotes && (
                  <>
                    <dt className="text-stone-500">מקום פעילות</dt>
                    <dd>{scholar.placeNotes}</dd>
                  </>
                )}
                {scholar.empire && (
                  <>
                    <dt className="text-stone-500">אימפריה</dt>
                    <dd>{scholar.empire.nameHe}</dd>
                  </>
                )}
              </dl>
            </section>

            {/* Chain of Transmission */}
            {(chainTeachers.length > 0 || chainStudents.length > 0) && (
            <section>
              <h2 className="section-title">שרשרת המסירה</h2>
              <div className="flex flex-col items-center gap-2">
                {/* Teachers */}
                {chainTeachers.length > 0 && (
                  <div className="w-full text-center">
                    <p className="text-xs text-ink-muted mb-2">רבותיו</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {chainTeachers.map((p, i) => <ChainChip key={`t${i}`} person={p} />)}
                    </div>
                  </div>
                )}

                {chainTeachers.length > 0 && <div className="text-ink-muted text-xl">↓</div>}

                <div className="px-6 py-3 bg-accent-soft rounded-xl font-bold text-lg text-accent-dark">
                  {scholar.nameHe}
                </div>

                {chainStudents.length > 0 && <div className="text-ink-muted text-xl">↓</div>}

                {/* Students */}
                {chainStudents.length > 0 && (
                  <div className="w-full text-center">
                    <p className="text-xs text-ink-muted mb-2">תלמידיו</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {chainStudents.map((p, i) => <ChainChip key={`s${i}`} person={p} />)}
                    </div>
                  </div>
                )}
              </div>
              {hasSefaria && (
                <p className="text-[11px] text-ink-muted mt-4 text-center">
                  חלק מהקשרים על פי מאגר הנושאים של{' '}
                  <a href={`https://www.sefaria.org/topics/${scholar.sefariaTopicSlug}`} target="_blank" rel="noopener noreferrer" className="link-accent underline">ספריא</a>
                </p>
              )}
            </section>
            )}

            {/* Biography */}
            {scholar.biographyShort && (
              <section>
                <h2 className="section-title">ביוגרפיה</h2>
                <p className="text-stone-700 leading-relaxed">{scholar.biographyShort}</p>
              </section>
            )}

            {/* Featured Quote */}
            {scholar.featuredQuote && (
              <section>
                <h2 className="section-title">אמרה נבחרת</h2>
                <blockquote className="border-r-4 border-accent pr-4 py-2 bg-accent-soft/60 rounded-l-lg">
                  <p className="text-lg text-stone-700 leading-relaxed">&ldquo;{scholar.featuredQuote}&rdquo;</p>
                </blockquote>
              </section>
            )}

            {/* Featured Story */}
            {scholar.featuredStory && (
              <section>
                <h2 className="section-title">מעשה נבחר</h2>
                <div className="prose prose-stone max-w-none text-stone-700">{scholar.featuredStory}</div>
              </section>
            )}

            {/* Sources */}
            {scholar.scholarSources.length > 0 && (
              <section>
                <h2 className="section-title">מקורות</h2>
                <ul className="space-y-2">
                  {scholar.scholarSources.map((ss) => (
                    <li key={ss.id} className="text-sm text-stone-600 border-r-2 border-stone-200 pr-3">
                      <span className="font-medium text-stone-700">{ss.source.titleHe}</span>
                      {ss.source.tractate && ` — ${ss.source.tractate}`}
                      {ss.source.chapter && `, פרק ${ss.source.chapter}`}
                      {ss.source.pageRef && `, ${ss.source.pageRef}`}
                      {ss.source.url && (
                        <>
                          {' '}
                          <a
                            href={ss.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-dark hover:underline"
                          >
                            (ספריא ↗)
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Relationships */}
            {(chevrutot.length > 0 || disputants.length > 0) && (
              <div className="scholar-card">
                <h3 className="font-display text-lg text-stone-700 mb-3">קשרים</h3>
                {chevrutot.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-stone-400 mb-1">חברותא</p>
                    {chevrutot.map((r) => (
                      <Link
                        key={r.id}
                        href={`/scholars/${r.peer.slug}`}
                        className="block text-sm text-stone-600 hover:text-accent-dark py-1"
                      >
                        {r.peer.nameHe}
                      </Link>
                    ))}
                  </div>
                )}
                {disputants.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-stone-400 mb-1">בר פלוגתא</p>
                    {disputants.map((r) => (
                      <Link
                        key={r.id}
                        href={`/scholars/${r.peer.slug}`}
                        className="block text-sm text-stone-600 hover:text-accent-dark py-1"
                      >
                        {r.peer.nameHe}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Memory Summary */}
            {scholar.memorySummary && (
              <div className="scholar-card bg-accent-soft/60">
                <h3 className="font-display text-lg text-stone-700 mb-2">לזכור את החכם</h3>
                <p className="text-sm text-stone-600">{scholar.memorySummary}</p>
              </div>
            )}

            {/* Places */}
            {scholar.scholarPlaces.length > 0 && (
              <div className="scholar-card">
                <h3 className="font-display text-lg text-stone-700 mb-2">מקומות</h3>
                {scholar.scholarPlaces.map((sp) => (
                  <p key={sp.id} className="text-sm text-stone-600">
                    📍 {sp.place.nameHe}
                  </p>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
