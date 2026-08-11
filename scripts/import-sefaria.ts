/**
 * Sefaria Import Script for Sharsheret HaMesirah
 *
 * Fetches person topics from the Sefaria API and maps them to the
 * Sharsheret HaMesirah scholar schema, outputting a JSON file suitable
 * for import via the admin endpoint or manual review.
 *
 * Usage:
 *   npx tsx scripts/import-sefaria.ts
 *
 *   # With options:
 *   npx tsx scripts/import-sefaria.ts --limit 200 --output sefaria-scholars.json
 *   npx tsx scripts/import-sefaria.ts --dry-run  (validate only, no file output)
 *   npx tsx scripts/import-sefaria.ts --slug-file existing-slugs.json  (skip duplicates)
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Types ──

/** Raw Sefaria topic shape (subset of fields we use) */
interface SefariaTopic {
  slug: string;
  category: string;
  primaryTitle: { en: string; he: string };
  secondaryTitles?: { en: string; he: string };
  description?: { en: string; he: string };
  properties?: Record<string, unknown>;
  isTopLevelDisplay?: boolean;
}

interface SefariaTopicsResponse {
  topics: SefariaTopic[];
  total?: number;
}

/** Simplified import scholar shape (subset of Prisma ScholarInput) */
interface ImportScholar {
  slug: string;
  nameHe: string;
  alternateNames: string[];
  period: string;
  birthStart: number | null;
  birthEnd: number | null;
  deathStart: number | null;
  deathEnd: number | null;
  dateConfidence: string;
  biographyShort: string | null;
  role: string | null;
  featuredQuote: string | null;
  featuredStory: string | null;
  memorySummary: string | null;
  status: string;
  sefariaSlug: string;
  sefariaUrl: string;
  /** Flags for review – indicates uncertain period detection */
  reviewNote?: string;
}

interface ImportOutput {
  generatedAt: string;
  totalTopics: number;
  importedScholars: number;
  skippedDuplicates: number;
  skippedNotPerson: number;
  scholars: ImportScholar[];
}

interface CliOptions {
  limit: number;
  output: string;
  dryRun: boolean;
  slugFile: string | null;
  baseUrl: string;
}

// ── Period Detection ──

/** Known Sefaria-era slugs that map to time periods */
const ERA_TO_PERIOD: Record<string, string> = {
  // Tannaim
  tannaim: 'TANNAIM',
  tannaitic: 'TANNAIM',
  'tannaitic-period': 'TANNAIM',
  'mishnaic-period': 'TANNAIM',
  mishnaic: 'TANNAIM',
  // Amoraim
  amoraim: 'AMORAIM_BAVEL', // default Bavel unless proven EY
  amoraic: 'AMORAIM_BAVEL',
  'amoraic-period': 'AMORAIM_BAVEL',
  // Zugot
  zugot: 'ZUGOT',
  'zugot-period': 'ZUGOT',
  // Anshei Knesset
  'anshei-knesset': 'ANSHEI_KNESSET',
  'men-of-the-great-assembly': 'ANSHEI_KNESSET',
  // Savoraim
  savoraim: 'SAVORAIM',
  saboraic: 'SAVORAIM',
  // Geonim (for reference, not in our current schema but can be extended)
  geonim: 'AMORAIM_BAVEL', // closest match
  gaonic: 'AMORAIM_BAVEL',
  // Rishonim / Acharonim — out of scope, tag for review
  rishonim: 'TANNAIM', // put in Tannaim with review note
  acharonim: 'TANNAIM', // put in Tannaim with review note
  medieval: 'TANNAIM',
  modern: 'TANNAIM',
};

/** Known patterns in Hebrew names that suggest certain periods */
const NAME_PERIOD_HINTS: Array<{ pattern: RegExp; period: string; confidence: string }> = [
  { pattern: /רבן\s+(יוחנן|גמליאל|שמעון)/i, period: 'TANNAIM', confidence: 'STRONG' },
  { pattern: /רבי\s+(עקיבא|מאיר|טרפון|יהודה|יוסי|שמעון|אליעזר|יהושע|ישמעאל)/i, period: 'TANNAIM', confidence: 'STRONG' },
  { pattern: /(רב|שמואל|אביי|רבא|רב\s+(הונא|אשי|ינא|יהודה|חסדא|נחמן|פפא|יוסף))/i, period: 'AMORAIM_BAVEL', confidence: 'STRONG' },
  { pattern: /(הלל|שמאי|יהודה\s+בן\s+טבאי|שמעון\s+בן\s+שטח|שמעיה|אבטליון)/i, period: 'ZUGOT', confidence: 'STRONG' },
  { pattern: /רבי\s+(יוחנן|אמי|אסי|אבהו|חנינא|שמואל\s+בר|זירא|הושעיא|ינאי)/i, period: 'AMORAIM_ERETZ_YISRAEL', confidence: 'STRONG' },
  { pattern: /רבן\s+יוחנן\s+בן\s+זכאי/i, period: 'TANNAIM', confidence: 'STRONG' },
  { pattern: /שמעון\s+הצדיק/i, period: 'ANSHEI_KNESSET', confidence: 'STRONG' },
  { pattern: /אנטיגנוס/i, period: 'ZUGOT', confidence: 'STRONG' },
];

/** Keywords in English descriptions that suggest a period */
const DESC_PERIOD_HINTS: Array<{ keywords: string[]; period: string }> = [
  { keywords: ['tanna', 'mishnah', 'mishna', 'tannaitic', 'tannaic', 'second temple'], period: 'TANNAIM' },
  { keywords: ['amora', 'talmud', 'amoraic'], period: 'AMORAIM_BAVEL' },
  { keywords: ['babylonian amora', 'bavel', 'pumbedita', 'sura', 'nehardea', 'mechuza'], period: 'AMORAIM_BAVEL' },
  { keywords: ['palestinian amora', 'tiberias', 'tzippori', 'caesarea', 'land of israel amora', 'yerushalmi'], period: 'AMORAIM_ERETZ_YISRAEL' },
  { keywords: ['zug', 'zugot', 'pairs'], period: 'ZUGOT' },
  { keywords: ['great assembly', 'anshei knesset', 'high priest'], period: 'ANSHEI_KNESSET' },
  { keywords: ['savora', 'saboraic'], period: 'SAVORAIM' },
];

/** Approximate year ranges for periods (used as fallback) */
const PERIOD_YEAR_RANGES: Record<string, { birthStart: number; birthEnd: number; deathStart: number; deathEnd: number }> = {
  ANSHEI_KNESSET: { birthStart: -400, birthEnd: -250, deathStart: -300, deathEnd: -190 },
  ZUGOT: { birthStart: -190, birthEnd: -20, deathStart: -150, deathEnd: 30 },
  TANNAIM: { birthStart: -10, birthEnd: 200, deathStart: 50, deathEnd: 220 },
  AMORAIM_ERETZ_YISRAEL: { birthStart: 180, birthEnd: 350, deathStart: 230, deathEnd: 400 },
  AMORAIM_BAVEL: { birthStart: 160, birthEnd: 450, deathStart: 230, deathEnd: 500 },
  SAVORAIM: { birthStart: 450, birthEnd: 550, deathStart: 500, deathEnd: 589 },
};

// ── Helpers ──

/** Create a URL-friendly Hebrew slug */
function makeSlug(hebrewName: string): string {
  return hebrewName
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/** Clean and normalize Hebrew text */
function cleanHebrew(text: string | undefined | null): string | null {
  if (!text) return null;
  return text.trim().replace(/\s+/g, ' ').replace(/<[^>]*>/g, '');
}

/** Detect period from all available signals */
function detectPeriod(topic: SefariaTopic): { period: string; confidence: string; reviewNote?: string } {
  // 1. Check name patterns first (highest confidence)
  for (const hint of NAME_PERIOD_HINTS) {
    if (hint.pattern.test(topic.primaryTitle.he)) {
      return { period: hint.period, confidence: hint.confidence };
    }
    // Also check secondary titles
    if (topic.secondaryTitles?.he) {
      if (hint.pattern.test(topic.secondaryTitles.he)) {
        return { period: hint.period, confidence: 'STRONG' };
      }
    }
  }

  // 2. Check description keywords
  const descText = [
    topic.description?.en || '',
    topic.description?.he || '',
    topic.secondaryTitles?.en || '',
  ].join(' ').toLowerCase();

  for (const hint of DESC_PERIOD_HINTS) {
    if (hint.keywords.some((kw) => descText.includes(kw))) {
      return { period: hint.period, confidence: 'STRONG' };
    }
  }

  // 3. Try Sefaria properties/categories
  if (topic.category) {
    const cat = topic.category.toLowerCase();
    if (ERA_TO_PERIOD[cat]) {
      return { period: ERA_TO_PERIOD[cat], confidence: 'TRADITIONAL' };
    }
  }

  // 4. Fallback — Tannaim as default Jewish historical person; flag for review
  return {
    period: 'TANNAIM',
    confidence: 'UNKNOWN',
    reviewNote: '⚠️ Period could not be auto-detected — defaulted to TANNAIM. Please review manually.',
  };
}

/** Map a Sefaria topic to our ImportScholar shape */
function mapTopicToScholar(topic: SefariaTopic): ImportScholar {
  const periodResult = detectPeriod(topic);
  const yearRange = PERIOD_YEAR_RANGES[periodResult.period] || PERIOD_YEAR_RANGES.TANNAIM;

  const slug = makeSlug(topic.primaryTitle.he);
  const nameHe = cleanHebrew(topic.primaryTitle.he) || topic.primaryTitle.he;
  const alternateNames: string[] = [];
  if (topic.secondaryTitles?.he && topic.secondaryTitles.he !== topic.primaryTitle.he) {
    const cleaned = cleanHebrew(topic.secondaryTitles.he);
    if (cleaned && cleaned !== nameHe) alternateNames.push(cleaned);
  }
  if (topic.secondaryTitles?.en) {
    alternateNames.push(topic.secondaryTitles.en);
  }

  const biography = cleanHebrew(topic.description?.he || null);
  const memorySummary = biography ? biography.slice(0, 200) : null;

  const scholar: ImportScholar = {
    slug,
    nameHe,
    alternateNames,
    period: periodResult.period,
    birthStart: yearRange.birthStart,
    birthEnd: yearRange.birthEnd,
    deathStart: yearRange.deathStart,
    deathEnd: yearRange.deathEnd,
    dateConfidence: periodResult.confidence === 'STRONG' ? 'TRADITIONAL' : 'UNKNOWN',
    biographyShort: biography,
    role: null,
    featuredQuote: null,
    featuredStory: null,
    memorySummary,
    status: 'DRAFT', // Always draft — requires manual review
    sefariaSlug: topic.slug,
    sefariaUrl: `https://www.sefaria.org/topics/${topic.slug}`,
  };

  if (periodResult.reviewNote) {
    scholar.reviewNote = periodResult.reviewNote;
  }

  return scholar;
}

/** Validate a scholar record for required fields */
function validateScholar(scholar: ImportScholar): string[] {
  const errors: string[] = [];
  if (!scholar.slug || scholar.slug.length === 0) errors.push('Missing slug');
  if (!scholar.nameHe || scholar.nameHe.length === 0) errors.push('Missing Hebrew name');
  if (!scholar.period) errors.push('Missing period');
  const validPeriods = ['ANSHEI_KNESSET', 'ZUGOT', 'TANNAIM', 'AMORAIM_ERETZ_YISRAEL', 'AMORAIM_BAVEL', 'SAVORAIM'];
  if (!validPeriods.includes(scholar.period)) errors.push(`Invalid period: ${scholar.period}`);
  return errors;
}

// ── Main ──

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    limit: 200,
    output: 'sefaria-scholars.json',
    dryRun: false,
    slugFile: null,
    baseUrl: 'https://www.sefaria.org',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--limit':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--slug-file':
        options.slugFile = args[++i];
        break;
      case '--base-url':
        options.baseUrl = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Sefaria Import Script — Sharsheret HaMesirah
=============================================

Fetches person topics from the Sefaria API and maps them to the
Sharsheret HaMesirah scholar schema.

Usage:
  npx tsx scripts/import-sefaria.ts [options]

Options:
  --limit <n>        Max topics to fetch (default: 200)
  --output, -o <file> Output JSON file (default: sefaria-scholars.json)
  --dry-run          Validate only, don't write output
  --slug-file <file> JSON array of existing slugs to skip (dedup)
  --base-url <url>   Sefaria base URL (default: https://www.sefaria.org)
  --help, -h         Show this help

The output JSON can be imported via:
  curl -X POST http://localhost:3000/api/admin/import/bulk \\
    -H "Content-Type: application/json" \\
    -d @sefaria-scholars.json
`);
}

async function fetchTopics(limit: number, baseUrl: string): Promise<SefariaTopic[]> {
  const url = `${baseUrl}/api/topics?slug=person&limit=${limit}`;
  console.log(`📡 Fetching Sefaria topics from: ${url}`);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Sharsheret-HaMesirah/1.0 (import script)',
    },
  });

  if (!response.ok) {
    throw new Error(`Sefaria API returned ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as SefariaTopicsResponse;

  if (!data.topics || !Array.isArray(data.topics)) {
    throw new Error('Unexpected API response format: missing "topics" array');
  }

  console.log(`   ✓ Received ${data.topics.length} topics (total available: ${data.total ?? 'unknown'})`);
  return data.topics;
}

function loadExistingSlugs(slugFile: string | null): Set<string> {
  if (!slugFile) return new Set();

  try {
    const raw = fs.readFileSync(slugFile, 'utf-8');
    const slugs: string[] = JSON.parse(raw);
    console.log(`📋 Loaded ${slugs.length} existing slugs from ${slugFile}`);
    return new Set(slugs.map((s) => s.toLowerCase().trim()));
  } catch (err) {
    console.warn(`⚠️  Could not read slug file "${slugFile}": ${err}. Proceeding without dedup.`);
    return new Set();
  }
}

async function main() {
  const opts = parseArgs();

  console.log('╔══════════════════════════════════════╗');
  console.log('║  Sefaria → Sharsheret HaMesirah      ║');
  console.log('║  Import Pipeline                     ║');
  console.log('╚══════════════════════════════════════╝\n');

  // Load existing slugs for dedup
  const existingSlugs = loadExistingSlugs(opts.slugFile);

  // Fetch topics
  const topics = await fetchTopics(opts.limit, opts.baseUrl);

  // Process topics
  console.log('\n🔄 Processing topics...');
  const scholars: ImportScholar[] = [];
  let skippedDuplicates = 0;
  let skippedNotPerson = 0;
  const seenSlugs = new Set(existingSlugs);
  const duplicateSlugs: string[] = [];
  const periodCounts: Record<string, number> = {};
  const validationWarnings: Array<{ slug: string; errors: string[] }> = [];

  for (const topic of topics) {
    // Filter: only person topics
    if (topic.category !== 'person') {
      skippedNotPerson++;
      continue;
    }

    const scholar = mapTopicToScholar(topic);

    // Dedup
    const normalizedSlug = scholar.slug.toLowerCase();
    if (seenSlugs.has(normalizedSlug)) {
      duplicateSlugs.push(scholar.slug);
      skippedDuplicates++;
      continue;
    }
    seenSlugs.add(normalizedSlug);

    // Validate
    const errors = validateScholar(scholar);
    if (errors.length > 0) {
      validationWarnings.push({ slug: scholar.slug, errors });
      // Still include — just flag for review
      if (!scholar.reviewNote) scholar.reviewNote = '';
      scholar.reviewNote += ' ⚠️ Validation: ' + errors.join('; ');
    }

    scholars.push(scholar);
    periodCounts[scholar.period] = (periodCounts[scholar.period] || 0) + 1;
  }

  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   Total topics fetched:    ${topics.length}`);
  console.log(`   Skipped (not person):    ${skippedNotPerson}`);
  console.log(`   Skipped (duplicates):    ${skippedDuplicates}`);
  console.log(`   Imported scholars:       ${scholars.length}`);

  if (duplicateSlugs.length > 0) {
    console.log(`\n   Duplicate slugs skipped:`);
    duplicateSlugs.forEach((s) => console.log(`     - ${s}`));
  }

  console.log('\n   Period distribution:');
  for (const [period, count] of Object.entries(periodCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${period.padEnd(25)} ${count}`);
  }

  if (validationWarnings.length > 0) {
    console.log(`\n   ⚠️  Validation warnings (${validationWarnings.length}):`);
    validationWarnings.slice(0, 10).forEach((w) => {
      console.log(`     - ${w.slug}: ${w.errors.join('; ')}`);
    });
    if (validationWarnings.length > 10) {
      console.log(`     ... and ${validationWarnings.length - 10} more`);
    }
  }

  // Scholars flagged for review
  const needsReview = scholars.filter((s) => s.reviewNote);
  if (needsReview.length > 0) {
    console.log(`\n   🔍 Scholars flagged for review: ${needsReview.length}`);
  }

  // Build output
  const output: ImportOutput = {
    generatedAt: new Date().toISOString(),
    totalTopics: topics.length,
    importedScholars: scholars.length,
    skippedDuplicates,
    skippedNotPerson,
    scholars,
  };

  // Write output
  if (!opts.dryRun) {
    const outputPath = path.resolve(opts.output);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n✅ Output written to: ${outputPath}`);
    console.log(`   File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
  } else {
    console.log('\n🔍 Dry run — no file written.');
    // Print first 3 scholars as sample
    console.log('\n   Sample scholars (first 3):');
    scholars.slice(0, 3).forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.nameHe} (${s.period}) — ${s.slug}`);
    });
  }

  console.log('\n📝 Next steps:');
  console.log('   1. Review the output JSON for accuracy');
  console.log('   2. Edit dates, quotes, and biographies as needed');
  console.log('   3. Import via admin API:');
  console.log('      POST /api/admin/import/bulk with the JSON body');
  console.log('   4. Or use Prisma directly with a custom seed script\n');

  return output;
}

main().catch((err) => {
  console.error('\n❌ Import failed:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
