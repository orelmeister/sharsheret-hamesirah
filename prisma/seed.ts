import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Reset: clear existing data in FK-safe order ──
  console.log('  🗑️  Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.scholarSource.deleteMany();
  await prisma.scholarPlace.deleteMany();
  await prisma.scholarTag.deleteMany();
  await prisma.scholarRuler.deleteMany();
  await prisma.scholarEvent.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.scholar.deleteMany();
  await prisma.source.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.place.deleteMany();
  await prisma.ruler.deleteMany();
  await prisma.event.deleteMany();
  await prisma.generation.deleteMany();
  await prisma.empire.deleteMany();
  await prisma.period.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Database cleared');

  // ── Periods ──
  const periods = await Promise.all([
    prisma.period.create({
      data: { nameHe: 'אנשי כנסת הגדולה', slug: 'anshei-knesset', color: '#2d8a4e', startYear: -350, endYear: -190, order: 1 },
    }),
    prisma.period.create({
      data: { nameHe: 'הזוגות', slug: 'zugot', color: '#2563eb', startYear: -190, endYear: 10, order: 2 },
    }),
    prisma.period.create({
      data: { nameHe: 'תנאים', slug: 'tannaim', color: '#d4a017', startYear: 10, endYear: 220, order: 3 },
    }),
    prisma.period.create({
      data: { nameHe: 'אמוראי ארץ ישראל', slug: 'amoraim-ey', color: '#ea580c', startYear: 220, endYear: 400, order: 4 },
    }),
    prisma.period.create({
      data: { nameHe: 'אמוראי בבל', slug: 'amoraim-bavel', color: '#dc2626', startYear: 220, endYear: 500, order: 5 },
    }),
    prisma.period.create({
      data: { nameHe: 'סבוראים', slug: 'savoraim', color: '#7c3aed', startYear: 500, endYear: 589, order: 6 },
    }),
  ]);
  console.log(`  ✓ ${periods.length} periods`);

  // ── Empires ──
  const persianEmpire = await prisma.empire.create({
    data: { nameHe: 'האימפריה הפרסית' },
  });
  const romanEmpire = await prisma.empire.create({
    data: { nameHe: 'האימפריה הרומית' },
  });
  const byzantineEmpire = await prisma.empire.create({
    data: { nameHe: 'האימפריה הביזנטית' },
  });
  const parthianEmpire = await prisma.empire.create({
    data: { nameHe: 'האימפריה הפרתית' },
  });
  const sassanianEmpire = await prisma.empire.create({
    data: { nameHe: 'האימפריה הסאסאנית' },
  });
  console.log('  ✓ 5 empires');

  // ── Places ──
  const places = await Promise.all([
    prisma.place.create({ data: { nameHe: 'ירושלים', nameEn: 'Jerusalem', lat: 31.7683, lng: 35.2137, region: 'יהודה' } }),
    prisma.place.create({ data: { nameHe: 'יבנה', nameEn: 'Yavne', lat: 31.8779, lng: 34.7463, region: 'שפלה' } }),
    prisma.place.create({ data: { nameHe: 'ציפורי', nameEn: 'Tzippori', lat: 32.7539, lng: 35.2784, region: 'גליל' } }),
    prisma.place.create({ data: { nameHe: 'טבריה', nameEn: 'Tiberias', lat: 32.7922, lng: 35.5312, region: 'גליל' } }),
    prisma.place.create({ data: { nameHe: 'סורא', nameEn: 'Sura', lat: 31.8833, lng: 44.4667, region: 'בבל' } }),
    prisma.place.create({ data: { nameHe: 'פומבדיתא', nameEn: 'Pumbedita', lat: 33.35, lng: 43.7833, region: 'בבל' } }),
    prisma.place.create({ data: { nameHe: 'נהרדעא', nameEn: 'Nehardea', lat: 33.3833, lng: 43.7167, region: 'בבל' } }),
    prisma.place.create({ data: { nameHe: 'מחוזא', nameEn: 'Mechuza', lat: 33.2667, lng: 44.4833, region: 'בבל' } }),
    prisma.place.create({ data: { nameHe: 'אושא', nameEn: 'Usha', lat: 32.8167, lng: 35.1333, region: 'גליל' } }),
    prisma.place.create({ data: { nameHe: 'בית שערים', nameEn: 'Beit Shearim', lat: 32.7, lng: 35.1333, region: 'גליל' } }),
    prisma.place.create({ data: { nameHe: 'לוד', nameEn: 'Lod', lat: 31.9514, lng: 34.8952, region: 'שפלה' } }),
    prisma.place.create({ data: { nameHe: 'בני ברק', nameEn: 'Bnei Brak', lat: 32.0834, lng: 34.8333, region: 'שפלה' } }),
    prisma.place.create({ data: { nameHe: 'קיסריה', nameEn: 'Caesarea', lat: 32.5, lng: 34.8917, region: 'שרון' } }),
    prisma.place.create({ data: { nameHe: 'אלכסנדריה', nameEn: 'Alexandria', lat: 31.2, lng: 29.9167, region: 'מצרים' } }),
    prisma.place.create({ data: { nameHe: 'מתא מחסיא', nameEn: 'Mata Mechasya', lat: 31.8833, lng: 44.4667, region: 'בבל' } }),
    prisma.place.create({ data: { nameHe: 'פקיעין', nameEn: 'Peki\'in', lat: 32.9775, lng: 35.3347, region: 'גליל' } }),
  ]);
  console.log(`  ✓ ${places.length} places`);

  // ── Sources (foundational) ──
  const sources = await Promise.all([
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'אבות', chapter: 'א', pageRef: 'פרק א, משנה א', url: 'https://www.sefaria.org/Pirkei_Avot.1.1' },
    }),
    prisma.source.create({
      data: { type: 'GEONIM', titleHe: 'איגרת רב שרירא גאון', author: 'רב שרירא גאון', url: 'https://www.sefaria.org/Iggeret_Rav_Sherira_Gaon' },
    }),
    prisma.source.create({
      data: { type: 'RISHONIM', titleHe: 'הקדמת הרמב"ם למשנה', author: 'רמב"ם', url: 'https://www.sefaria.org/Rambam_Introduction_to_the_Mishnah' },
    }),
    prisma.source.create({
      data: { type: 'RISHONIM', titleHe: 'ספר הקבלה', author: 'ראב"ד', url: 'https://www.sefaria.org/Sefer_HaKabbalah' },
    }),
    prisma.source.create({
      data: { type: 'ACHARONIM', titleHe: 'סדר הדורות', author: 'רבי יחיאל היילפרין' },
    }),
    prisma.source.create({
      data: { type: 'MIDRASH', titleHe: 'אבות דרבי נתן', url: 'https://www.sefaria.org/Avot_D%27Rabbi_Natan' },
    }),
    // Additional sources for expanded scholars
    prisma.source.create({
      data: { type: 'MISHNAH', titleHe: 'משנה', tractate: 'אבות', chapter: 'א', pageRef: 'משנה ו-טו', url: 'https://www.sefaria.org/Pirkei_Avot' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'ברכות', url: 'https://www.sefaria.org/Berakhot' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'שבת', url: 'https://www.sefaria.org/Shabbat' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'פסחים', url: 'https://www.sefaria.org/Pesachim' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'יומא', url: 'https://www.sefaria.org/Yoma' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'גיטין', url: 'https://www.sefaria.org/Gittin' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'קידושין', url: 'https://www.sefaria.org/Kiddushin' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'בבא מציעא', url: 'https://www.sefaria.org/Bava_Metzia' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'בבא בתרא', url: 'https://www.sefaria.org/Bava_Batra' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'סנהדרין', url: 'https://www.sefaria.org/Sanhedrin' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'מנחות', url: 'https://www.sefaria.org/Menachot' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'סוכה', url: 'https://www.sefaria.org/Sukkah' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'ראש השנה', url: 'https://www.sefaria.org/Rosh_Hashanah' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'תענית', url: 'https://www.sefaria.org/Taanit' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'חגיגה', url: 'https://www.sefaria.org/Chagigah' },
    }),
    prisma.source.create({
      data: { type: 'YERUSHALMI', titleHe: 'תלמוד ירושלמי', url: 'https://www.sefaria.org/Jerusalem_Talmud' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'עירובין', url: 'https://www.sefaria.org/Eruvin' },
    }),
    prisma.source.create({
      data: { type: 'BAVLI', titleHe: 'תלמוד בבלי', tractate: 'עבודה זרה', url: 'https://www.sefaria.org/Avodah_Zarah' },
    }),
  ]);
  console.log(`  ✓ ${sources.length} sources`);

  // ── Tags ──
  const tags = await Promise.all([
    prisma.tag.create({ data: { nameHe: 'סנהדרין', slug: 'sanhedrin' } }),
    prisma.tag.create({ data: { nameHe: 'נשיא', slug: 'nasi' } }),
    prisma.tag.create({ data: { nameHe: 'אב בית דין', slug: 'av-bet-din' } }),
    prisma.tag.create({ data: { nameHe: 'ראש ישיבה', slug: 'rosh-yeshiva' } }),
    prisma.tag.create({ data: { nameHe: 'עשרה הרוגי מלכות', slug: 'asarah-harugei-malchut' } }),
    prisma.tag.create({ data: { nameHe: 'קבלה', slug: 'kabbalah' } }),
    prisma.tag.create({ data: { nameHe: 'משנה', slug: 'mishnah' } }),
    prisma.tag.create({ data: { nameHe: 'תנא', slug: 'tanna' } }),
    prisma.tag.create({ data: { nameHe: 'אמורא', slug: 'amora' } }),
    prisma.tag.create({ data: { nameHe: 'ישיבת סורא', slug: 'yeshivat-sura' } }),
    prisma.tag.create({ data: { nameHe: 'ישיבת פומבדיתא', slug: 'yeshivat-pumbedita' } }),
    prisma.tag.create({ data: { nameHe: 'ישיבת נהרדעא', slug: 'yeshivat-nehardea' } }),
    prisma.tag.create({ data: { nameHe: 'מהדורת התלמוד', slug: 'talmud-redaction' } }),
  ]);
  console.log(`  ✓ ${tags.length} tags`);

  // ── Scholars (initial 6 from spec) ──

  // 1. Shimon HaTzadik
  const shimon = await prisma.scholar.create({
    data: {
      slug: 'shimon-hatzadik',
      nameHe: 'שמעון הצדיק',
      alternateNames: ['שמעון הראשון', 'שמעון בן חוניו'],
      period: 'ANSHEI_KNESSET',
      birthStart: -350,
      birthEnd: -300,
      deathStart: -270,
      deathEnd: -250,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'שמעון הצדיק היה כהן גדול משיירי אנשי כנסת הגדולה. שימש בכהונה גדולה כארבעים שנה ונחשב לאחד מגדולי התקופה. במשנה נאמר: "שמעון הצדיק היה משיירי אנשי כנסת הגדולה". לפי המסורת, הוא זה שיצא לקבל את פני אלכסנדר מוקדון.',
      role: 'כהן גדול',
      placeNotes: 'ירושלים, בית המקדש',
      featuredQuote:
        'על שלושה דברים העולם עומד: על התורה, ועל העבודה, ועל גמילות חסדים.',
      featuredStory:
        'שמעון הצדיק יצא לקראת אלכסנדר מוקדון בלבושי כהונה, וכשראה אותו אלכסנדר ירד ממרכבתו והשתחווה לו. אמר לבני לווייתו: "דמות דיוקנו של זה מנצחת לפניי במלחמה".',
      memorySummary: 'כהן גדול משיירי אנשי כנסת הגדולה, קבע את שלושת עמודי העולם: תורה, עבודה וגמילות חסדים.',
      status: 'PUBLISHED',
      empireId: persianEmpire.id,
    },
  });

  // 2. Antignos Ish Socho
  const antignos = await prisma.scholar.create({
    data: {
      slug: 'antignos-ish-socho',
      nameHe: 'אנטיגנוס איש סוכו',
      alternateNames: ['אנטיגנוס'],
      period: 'ZUGOT',
      birthStart: -270,
      birthEnd: -250,
      deathStart: -200,
      deathEnd: -190,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'אנטיגנוס איש סוכו קיבל תורה משמעון הצדיק. שימש כגשר בין תקופת אנשי כנסת הגדולה לתקופת הזוגות. תלמידיו היו צדוק ובייתוס שפרשו ויצרו את הכיתות.',
      role: 'חכם, מקשר הדורות',
      placeNotes: 'ירושלים',
      featuredQuote:
        'אל תהיו כעבדים המשמשים את הרב על מנת לקבל פרס, אלא הוו כעבדים המשמשים את הרב שלא על מנת לקבל פרס, ויהי מורא שמים עליכם.',
      featuredStory:
        'מתלמידיו צדוק ובייתוס יצאו הכיתות הצדוקית והבייתוסית, שכפרו בתורה שבעל פה. חז"ל רואים בכך את הסכנה שבהבנה לא נכונה של דברי חכמים.',
      memorySummary: 'קיבל משמעון הצדיק, העביר ליוסי בן יועזר ויוסי בן יוחנן. אמרתו על "שלא על מנת לקבל פרס" היא יסוד בעבודת ה׳.',
      status: 'PUBLISHED',
      empireId: persianEmpire.id,
    },
  });

  // 3. Yosei ben Yoezer
  const yoezer = await prisma.scholar.create({
    data: {
      slug: 'yosei-ben-yoezer',
      nameHe: 'יוסי בן יועזר איש צרידה',
      alternateNames: ['יוסי בן יועזר'],
      period: 'ZUGOT',
      birthStart: -200,
      birthEnd: -180,
      deathStart: -145,
      deathEnd: -130,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'יוסי בן יועזר איש צרידה היה נשיא הסנהדרין הראשון מתקופת הזוגות, לצד יוסי בן יוחנן איש ירושלים שהיה אב בית דין. היה מחסידי בית שני ונהרג על קידוש השם בידי היוונים.',
      role: 'נשיא הסנהדרין (הראשון בזוגות)',
      placeNotes: 'צרידה (שומרון), ירושלים',
      featuredQuote:
        'יהי ביתך בית ועד לחכמים, והוי מתאבק בעפר רגליהם, והוי שותה בצמא את דבריהם.',
      featuredStory:
        'נהרג על קידוש השם בימי גזירות היוונים. מסופר שהעלהו לצלוב והבטיחו לו שאם יסכים לעבור על דברי תורה ינצל, וסירב.',
      memorySummary: 'ראשון הזוגות (נשיא), נהרג על קידוש השם.',
      status: 'PUBLISHED',
      empireId: persianEmpire.id,
    },
  });

  // 4. Yosei ben Yochanan
  const yochanan = await prisma.scholar.create({
    data: {
      slug: 'yosei-ben-yochanan',
      nameHe: 'יוסי בן יוחנן איש ירושלים',
      alternateNames: ['יוסי בן יוחנן'],
      period: 'ZUGOT',
      birthStart: -200,
      birthEnd: -180,
      deathStart: -145,
      deathEnd: -130,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'יוסי בן יוחנן איש ירושלים היה אב בית הדין הראשון בתקופת הזוגות, בן זוגו של יוסי בן יועזר איש צרידה. קיבל מאנטיגנוס איש סוכו.',
      role: 'אב בית דין (הראשון בזוגות)',
      placeNotes: 'ירושלים',
      featuredQuote:
        'יהי ביתך פתוח לרווחה, ויהיו עניים בני ביתך.',
      featuredStory:
        'היה ידוע בהכנסת אורחים ובצדקה. מסופר שכל רכושו היה פתוח לעניים ולעוברי דרכים.',
      memorySummary: 'ראשון אבות בית הדין בתקופת הזוגות, איש ירושלים.',
      status: 'PUBLISHED',
      empireId: persianEmpire.id,
    },
  });

  // 5. Yehoshua ben Perachya
  const yehoshua = await prisma.scholar.create({
    data: {
      slug: 'yehoshua-ben-perachya',
      nameHe: 'יהושע בן פרחיה',
      alternateNames: ['יהושע בן פרחיה'],
      period: 'ZUGOT',
      birthStart: -140,
      birthEnd: -120,
      deathStart: -60,
      deathEnd: -50,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'יהושע בן פרחיה היה נשיא הסנהדרין, בן זוגו של נתאי הארבלי. קיבל מיוסי בן יועזר ויוסי בן יוחנן. ברח למצרים בימי ינאי המלך מפני גזירות.',
      role: 'נשיא הסנהדרין',
      placeNotes: 'ירושלים, אלכסנדריה',
      featuredQuote:
        'עשה לך רב, וקנה לך חבר, והוי דן את כל האדם לכף זכות.',
      featuredStory:
        'הרב של ישו הנוצרי לפי מסורת אחת. ברח לאלכסנדריה בימי ינאי המלך, וכשחזר דחה את אחד מתלמידיו (ישו) "בשתי ידיים".',
      memorySummary: 'נשיא, ברח למצרים בימי ינאי, אמרתו "הוי דן את כל האדם לכף זכות".',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 6. Nitai HaArbeli
  const nitai = await prisma.scholar.create({
    data: {
      slug: 'nitai-haarbeli',
      nameHe: 'נתאי הארבלי',
      alternateNames: ['נתאי הארבלי', 'מתי הארבלי'],
      period: 'ZUGOT',
      birthStart: -140,
      birthEnd: -120,
      deathStart: -60,
      deathEnd: -50,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'נתאי הארבלי היה אב בית דין בתקופת הזוגות, בן זוגו של יהושע בן פרחיה. מוצאו מארבל שבגליל. קיבל מיוסי בן יועזר ויוסי בן יוחנן, ומסר ליהודה בן טבאי ושמעון בן שטח.',
      role: 'אב בית דין',
      placeNotes: 'ארבל (גליל), ירושלים',
      featuredQuote:
        'הרחק משכן רע, ואל תתחבר לרשע, ואל תתייאש מן הפורענות.',
      memorySummary: 'אב בית דין, איש ארבל.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // ══════════════════════════════════════════════════════════════
  // EXPANDED SCHOLARS — Zugot #3-#5
  // ══════════════════════════════════════════════════════════════

  // 7. Yehuda ben Tabbai (Zug #3 — Nasi)
  const yehudaTabbai = await prisma.scholar.create({
    data: {
      slug: 'yehuda-ben-tabbai',
      nameHe: 'יהודה בן טבאי',
      alternateNames: ['יהודה בן טבאי'],
      period: 'ZUGOT',
      birthStart: -130,
      birthEnd: -110,
      deathStart: -60,
      deathEnd: -40,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'יהודה בן טבאי היה נשיא הסנהדרין, בן זוגו של שמעון בן שטח. קיבל מיהושע בן פרחיה ונתאי הארבלי. ברח לאלכסנדריה לאחר שהרג עד זומם שלא כדין, וחזר בזכות שמעון בן שטח.',
      role: 'נשיא הסנהדרין',
      placeNotes: 'ירושלים, אלכסנדריה',
      featuredQuote:
        'אל תעש עצמך כעורכי הדיינים; וכשיהיו בעלי דין עומדים לפניך, יהיו בעיניך כרשעים; וכשנפטרים מלפניך, יהיו בעיניך כזכאים, כשיקבלו עליהם את הדין.',
      featuredStory:
        'הרג עד זומם שלא כדין (לפני שנגמר הדין) וברח לאלכסנדריה. שמעון בן שטח כתב לו: "ממני ירושלים עיר הקודש אליך אלכסנדריה. עד מתי בעלי שוכן בתוכך ואני יושבת עגומה". חזר וקיבל על עצמו שלא יפסוק הלכה אלא במעמד שמעון בן שטח.',
      memorySummary: 'נשיא, זוג של שמעון בן שטח. ברח לאלכסנדריה לאחר טעות בדין.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 8. Shimon ben Shetach (Zug #3 — Av Beit Din)
  const shimonShetach = await prisma.scholar.create({
    data: {
      slug: 'shimon-ben-shetach',
      nameHe: 'שמעון בן שטח',
      alternateNames: ['שמעון בן שטח'],
      period: 'ZUGOT',
      birthStart: -130,
      birthEnd: -110,
      deathStart: -60,
      deathEnd: -40,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'שמעון בן שטח היה אב בית דין בתקופת הזוגות, בן זוגו של יהודה בן טבאי. אחיה של שלומציון המלכה. פעל רבות לחיזוק התורה, להשיב עטרה ליושנה, ולהקים מוסדות חינוך. תיקן תקנות חשובות בנושאי כתובה ונשואין.',
      role: 'אב בית דין, אח המלכה שלומציון',
      placeNotes: 'ירושלים',
      featuredQuote:
        'הוי מרבה לחקור את העדים, והוי זהיר בדבריך שמא מתוכם ילמדו לשקר.',
      featuredStory:
        'תלה שמונים נשים מכשפות באשקלון ביום אחד. פעל להחזיר את יהודה בן טבאי מאלכסנדריה. בתקופתו חזרו חכמי ההלכה לגדולתם אחרי רדיפות הצדוקים. תיקן שכתובת אישה תהיה על כל נכסי הבעל.',
      memorySummary: 'אב בית דין, אח שלומציון, תלה מכשפות, החזיר עטרה ליושנה.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 9. Shemaya (Zug #4 — Nasi)
  const shemaya = await prisma.scholar.create({
    data: {
      slug: 'shemaya',
      nameHe: 'שמעיה',
      alternateNames: ['שמעיה'],
      period: 'ZUGOT',
      birthStart: -80,
      birthEnd: -60,
      deathStart: -10,
      deathEnd: 10,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'שמעיה היה נשיא הסנהדרין, בן זוגו של אבטליון. לפי המסורת היו שניהם מגרי הצדק, מצאצאי סנחריב. קיבלו מיהודה בן טבאי ושמעון בן שטח, ומסרו להלל ושמאי.',
      role: 'נשיא הסנהדרין',
      placeNotes: 'ירושלים',
      featuredQuote:
        'אהוב את המלאכה, ושנא את הרבנות, ואל תתוודע לרשות.',
      featuredStory:
        'היה כהן גדול ביום הכיפורים, וכשיצא מבית המקדש ליווהו כל העם. כשראו את שמעיה ואבטליון, עזבו את הכהן הגדול והלכו אחריהם. באו שמעיה ואבטליון להיפרד ממנו, אמר להם: "יבואו בני עממין לשלום".',
      memorySummary: 'נשיא מגרי הצדק, מצאצאי סנחריב. "אהוב את המלאכה ושנא את הרבנות".',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 10. Avtalyon (Zug #4 — Av Beit Din)
  const avtalyon = await prisma.scholar.create({
    data: {
      slug: 'avtalyon',
      nameHe: 'אבטליון',
      alternateNames: ['אבטליון'],
      period: 'ZUGOT',
      birthStart: -80,
      birthEnd: -60,
      deathStart: -10,
      deathEnd: 10,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'אבטליון היה אב בית דין בתקופת הזוגות, בן זוגו של שמעיה. גר צדק מצאצאי סנחריב. קיבל מיהודה בן טבאי ושמעון בן שטח, ומסר להלל ושמאי.',
      role: 'אב בית דין',
      placeNotes: 'ירושלים',
      featuredQuote:
        'חכמים, הזהרו בדבריכם, שמא תחובו חובת גלות ותגלו למקום מים הרעים, וישתו התלמידים הבאים אחריכם וימותו, ונמצא שם שמים מתחלל.',
      featuredStory:
        'הלל הזקן שימש את שמעיה ואבטליון ארבעים שנה ולמד מהם תורה. הלל סיפר שפעם אחת בערב שבת שכחו לעצור את המים להכנת מקווה, והוא למד מהם שאפילו במקרה כזה יש להקפיד על גדרי ההלכה.',
      memorySummary: 'אב בית דין, גר צדק מצאצאי סנחריב. "חכמים הזהרו בדבריכם".',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 11. Hillel (Zug #5 — Nasi)
  const hillel = await prisma.scholar.create({
    data: {
      slug: 'hillel-hazaken',
      nameHe: 'הלל הזקן',
      alternateNames: ['הלל', 'הלל הבבלי'],
      period: 'ZUGOT',
      birthStart: -110,
      birthEnd: -70,
      deathStart: 10,
      deathEnd: 20,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'הלל הזקן היה נשיא הסנהדרין, בן זוגו של שמאי. עלה מבבל ולמד אצל שמעיה ואבטליון. מייסד בית הלל. נודע בענוותנותו, בסבלנותו ובמידותיו הטובות. קבע את שבע המידות שהתורה נדרשת בהן.',
      role: 'נשיא הסנהדרין, מייסד בית הלל',
      placeNotes: 'בבל, ירושלים',
      featuredQuote:
        'מה ששנוא עליך אל תעשה לחברך — זו היא כל התורה כולה, ואידך פירושה הוא, זיל גמור.',
      featuredStory:
        'בא לפניו גר שביקש ללמוד את כל התורה על רגל אחת. אמר לו הלל: "מה ששנוא עליך אל תעשה לחברך — זו היא כל התורה כולה, ואידך פירושה הוא, זיל גמור". לעומתו, שמאי דחפו באמת הבניין. מסופר שעני אחד בא לבית הלל בערב שבת, והלל דאג לו בעצמו לכבוד שבת למרות עושרו.',
      memorySummary: 'נשיא, מייסד בית הלל. "מה ששנוא עליך אל תעשה לחברך". ענוותן וסבלן.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 12. Shammai (Zug #5 — Av Beit Din)
  const shammai = await prisma.scholar.create({
    data: {
      slug: 'shammai-hazaken',
      nameHe: 'שמאי הזקן',
      alternateNames: ['שמאי'],
      period: 'ZUGOT',
      birthStart: -80,
      birthEnd: -50,
      deathStart: 20,
      deathEnd: 30,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'שמאי הזקן היה אב בית דין בתקופת הזוגות, בן זוגו של הלל. מייסד בית שמאי. נודע בקפדנותו בהלכה ובחריפותו. למרות המחלוקות הרבות עם הלל, המחלוקת הייתה לשם שמים.',
      role: 'אב בית דין, מייסד בית שמאי',
      placeNotes: 'ירושלים',
      featuredQuote:
        'עשה תורתך קבע, אמור מעט ועשה הרבה, והוי מקבל את כל האדם בסבר פנים יפות.',
      featuredStory:
        'שלושה גרים באו לפני שמאי וביקשו להתגייר בתנאים שונים. שמאי דחפם באמת הבניין שבידו. באו לפני הלל וגיירם. אמרו חכמים: "לעולם תהא ענוותן כהלל, ולא קפדן כשמאי".',
      memorySummary: 'אב בית דין, מייסד בית שמאי. "עשה תורתך קבע... אמור מעט ועשה הרבה".',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // ══════════════════════════════════════════════════════════════
  // EXPANDED SCHOLARS — Tannaim
  // ══════════════════════════════════════════════════════════════

  // 13. Rabban Gamliel HaZaken
  const gamlielHazaken = await prisma.scholar.create({
    data: {
      slug: 'rabban-gamliel-hazaken',
      nameHe: 'רבן גמליאל הזקן',
      alternateNames: ['רבן גמליאל הראשון', 'גמליאל הזקן'],
      period: 'TANNAIM',
      birthStart: 10,
      birthEnd: 30,
      deathStart: 50,
      deathEnd: 70,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבן גמליאל הזקן היה נשיא הסנהדרין, בנו של רבן שמעון בן הלל (ובן הלל הזקן). פעל בימי הבית השני ולפני חורבנו. מוזכר במעשי השליחים כמלומדו של פאולוס.',
      role: 'נשיא הסנהדרין',
      placeNotes: 'ירושלים',
      featuredQuote:
        'עשה לך רב, והסתלק מן הספק, ואל תרבה לעשר אומדות.',
      featuredStory:
        'תיקן תקנות חשובות בענייני גיטין וקידושין כדי להגן על נשים. תיקן גם את נוסח ברכת המינים.',
      memorySummary: 'נשיא, נכדו של הלל. תיקן תקנות בנושאי נישואין וגיטין.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 14. Rabban Shimon ben Gamliel I
  const shimonGamlielI = await prisma.scholar.create({
    data: {
      slug: 'rabban-shimon-ben-gamliel-i',
      nameHe: 'רבן שמעון בן גמליאל הראשון',
      alternateNames: ['שמעון בן גמליאל הזקן', 'רשב"ג הזקן'],
      period: 'TANNAIM',
      birthStart: 20,
      birthEnd: 40,
      deathStart: 65,
      deathEnd: 70,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבן שמעון בן גמליאל הראשון היה נשיא הסנהדרין בימי המרד הגדול, בנו של רבן גמליאל הזקן. נהרג עם חורבן הבית השני, ונמנה בין עשרת הרוגי מלכות.',
      role: 'נשיא הסנהדרין, מעשרה הרוגי מלכות',
      placeNotes: 'ירושלים',
      featuredQuote:
        'כל ימי גדלתי בין החכמים, ולא מצאתי לגוף טוב אלא שתיקה.',
      featuredStory:
        'נהרג עם חורבן ירושלים. מסופר שראשו הושם בפדיון, ואשתו לא הסכימה לפדותו בכסף כדי שלא יהרגו חכמים אחרים. היה מנשיאי ישראל האחרונים לפני החורבן.',
      memorySummary: 'נשיא, נהרג בחורבן הבית. "לא מצאתי לגוף טוב אלא שתיקה".',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 15. Rabban Yochanan ben Zakkai
  const rybz = await prisma.scholar.create({
    data: {
      slug: 'rabban-yochanan-ben-zakkai',
      nameHe: 'רבן יוחנן בן זכאי',
      alternateNames: ['ריב"ז', 'יוחנן בן זכאי'],
      period: 'TANNAIM',
      birthStart: 1,
      birthEnd: 20,
      deathStart: 80,
      deathEnd: 90,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבן יוחנן בן זכאי היה מגדולי התנאים, תלמידו של הלל הזקן. בתקופת המצור על ירושלים יצא בחשאי והקים את המרכז התורני ביבנה, ובכך הציל את התורה שבעל פה. כונה "רבן" ונחשב למייסד תקופת יבנה.',
      role: 'נשיא, מייסד מרכז יבנה',
      placeNotes: 'ירושלים, יבנה',
      featuredQuote:
        'אם למדת תורה הרבה, אל תחזיק טובה לעצמך, כי לכך נוצרת.',
      featuredStory:
        'בזמן המצור על ירושלים, העמיד פני מת והוצא בארון מהעיר. הגיע למפקד הרומאי אספסיאנוס ואמר לו: "שלום עליך המלך". באותו רגע הגיע שליח מרומא ובישר שאספסיאנוס מונה לקיסר. אספסיאנוס אמר לו: "שאל מה שאתה מבקש". ביקש: "תן לי יבנה וחכמיה". בכך הציל את התורה.',
      memorySummary: 'מציל התורה שבעל פה. הקים את יבנה. "תן לי יבנה וחכמיה".',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 16. Rabbi Eliezer ben Hyrcanus
  const eliezerHyrcanus = await prisma.scholar.create({
    data: {
      slug: 'rabbi-eliezer-ben-hyrcanus',
      nameHe: 'רבי אליעזר בן הורקנוס',
      alternateNames: ['רבי אליעזר הגדול', 'אליעזר בן הורקנוס'],
      period: 'TANNAIM',
      birthStart: 30,
      birthEnd: 50,
      deathStart: 100,
      deathEnd: 120,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי אליעזר בן הורקנוס היה מגדולי תלמידיו של רבן יוחנן בן זכאי. נודע כ"בור סיד שאינו מאבד טיפה". התחיל ללמוד תורה בגיל מאוחר יחסית. היה גיסו של רבן גמליאל דיבנה. לאחר מחלוקת תנורו של עכנאי נודה.',
      role: 'תנא, תלמיד רבן יוחנן בן זכאי',
      placeNotes: 'לוד, ירושלים, יבנה',
      featuredQuote:
        'יהי כבוד חברך חביב עליך כשלך, ואל תהי נוח לכעוס.',
      featuredStory:
        'התחיל ללמוד תורה בגיל 28. ברח מבית אביו (שהיה עשיר) לירושלים. כשרבן יוחנן בן זכאי ראה אותו בוכה, שאל מדוע. סיפר לו אליעזר שהוא רוצה ללמוד תורה. אמר לו רבן יוחנן: "אם למדת תורה הרבה — אל תחזיק טובה לעצמך". במחלוקת תנורו של עכנאי, יצאה בת קול ואמרה "הלכה כרבי אליעזר", אך רבי יהושע קם ואמר "לא בשמים היא".',
      memorySummary: '"בור סיד שאינו מאבד טיפה". נודה במחלוקת תנורו של עכנאי.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 17. Rabbi Yehoshua ben Chananya
  const yehoshuaChananya = await prisma.scholar.create({
    data: {
      slug: 'rabbi-yehoshua-ben-chananya',
      nameHe: 'רבי יהושע בן חנניה',
      alternateNames: ['רבי יהושע', 'יהושע בן חנניה'],
      period: 'TANNAIM',
      birthStart: 30,
      birthEnd: 50,
      deathStart: 110,
      deathEnd: 130,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי יהושע בן חנניה היה מגדולי תלמידיו של רבן יוחנן בן זכאי. היה לוי ועבד בבית המקדש. נודע כעניו ובעל דעת רחבה. שימש כאב בית דין ביבנה לצד רבן גמליאל. נודע בעימותיו עם הקיסר הרומי וחכמי אתונה.',
      role: 'אב בית דין, לוי בבית המקדש',
      placeNotes: 'פקיעין, יבנה, ירושלים',
      featuredQuote:
        'עין הרע ויצר הרע ושנאת הבריות מוציאין את האדם מן העולם.',
      featuredStory:
        'כשהיה תינוק, אמו הביאה אותו לבית המדרש כדי שיתחנך לתורה. כשרבן גמליאל השני ראה את כיעורו (היה מכוער), שאל: "כמה יופי יש בחבית זו?" וביקש לראות את חכמתו. ניצח את חכמי אתונה בוויכוחים רבים. אמר על עצמו: "מימיי לא נצחני אדם חוץ מאישה אחת".',
      memorySummary: 'עניו ובעל חוכמה. "לא בשמים היא". ניצח את חכמי אתונה.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 18. Rabbi Akiva
  const akiva = await prisma.scholar.create({
    data: {
      slug: 'rabbi-akiva',
      nameHe: 'רבי עקיבא',
      alternateNames: ['רבי עקיבא בן יוסף', 'עקיבא בן יוסף'],
      period: 'TANNAIM',
      birthStart: 40,
      birthEnd: 50,
      deathStart: 132,
      deathEnd: 135,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי עקיבא בן יוסף היה מגדולי התנאים. החל ללמוד תורה בגיל 40 בעידוד רעייתו רחל בת כלבא שבוע. הפך למורה הגדול ביותר של תורה שבעל פה, העמיד 24,000 תלמידים. תמך במרד בר כוכבא ונהרג על קידוש השם בהריגה ממושכת. היה מעשרה הרוגי מלכות.',
      role: 'תנא, ראש ישיבה בבני ברק, מעשרה הרוגי מלכות',
      placeNotes: 'בני ברק, לוד, קיסריה',
      featuredQuote:
        'ואהבת לרעך כמוך — זה כלל גדול בתורה.',
      featuredStory:
        'היה רועה צאן ועם הארץ עד גיל 40. רחל בת כלבא שבוע ראתה את כוחותיו והתנתה את נישואיהם בכך שילך ללמוד תורה. אביה הדיר אותה מנכסיו. רבי עקיבא יצא ללמוד 24 שנה. כשחזר עם 24,000 תלמידים, שמעה אשתו ובאה לקראתו. תלמידיו ניסו לדחותה, אך אמר להם: "שלי ושלכם — שלה הוא". נהרג בקיסריה בסריקת בשרו במסרקות ברזל, והיה קורא קריאת שמע. שאלו תלמידיו: "עד כאן?" ענה: "כל ימיי הייתי מצטער על פסוק ׳בכל נפשך׳ — אפילו נוטל את נשמתך. אמרתי: מתי יבוא לידי ואקיימנו".',
      memorySummary: 'גדול התנאים. "ואהבת לרעך כמוך — כלל גדול בתורה". רעייתו רחל. נהרג על קידוש השם.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 19. Rabbi Tarfon
  const tarfon = await prisma.scholar.create({
    data: {
      slug: 'rabbi-tarfon',
      nameHe: 'רבי טרפון',
      alternateNames: ['טרפון'],
      period: 'TANNAIM',
      birthStart: 50,
      birthEnd: 70,
      deathStart: 120,
      deathEnd: 140,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי טרפון היה תנא בדור השלישי, כהן וחברו של רבי עקיבא. התגורר בלוד. נודע כעשיר גדול ובעל צדקה. השתתף בוויכוחים עם חכמים אחרים ובמסורת ההלכה.',
      role: 'תנא, כהן',
      placeNotes: 'לוד',
      featuredQuote:
        'לא עליך המלאכה לגמור, ולא אתה בן חורין להיבטל ממנה.',
      featuredStory:
        'היה עשיר גדול. מסופר עליו שאמר: "כל הנותן פרוטה לעני — מתברך בשש ברכות, והמפייסו בדברים — מתברך באחת עשרה". סירב לקבל שכר על מצוות הכהונה. נחלק רבות עם רבי עקיבא בהלכה.',
      memorySummary: 'כהן עשיר, בעל צדקה. "לא עליך המלאכה לגמור". חברו של רבי עקיבא.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 20. Rabbi Yishmael
  const yishmael = await prisma.scholar.create({
    data: {
      slug: 'rabbi-yishmael',
      nameHe: 'רבי ישמעאל',
      alternateNames: ['רבי ישמעאל בן אלישע', 'ישמעאל בן אלישע כהן גדול'],
      period: 'TANNAIM',
      birthStart: 60,
      birthEnd: 80,
      deathStart: 120,
      deathEnd: 135,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי ישמעאל בן אלישע היה תנא בדור השלישי, כהן גדול. מייסד שיטת "דיברה תורה כלשון בני אדם" במידות שהתורה נדרשת בהן. מהרוגי מלכות, נהרג בידי הרומאים. נודע כבעל המידות לבית ישמעאל.',
      role: 'תנא, כהן גדול, מעשרה הרוגי מלכות',
      placeNotes: 'ירושלים',
      featuredQuote:
        'דיברה תורה כלשון בני אדם.',
      featuredStory:
        'כשנהרג על קידוש השם, בתו של הקיסר הרומי ביקשה שישאירו את עור פניו היפה. הפשיטו את עור פניו בעודו חי. כשהגיעו למקום התפילין, צעק. אמרו לו מלאכי השרת: "אם תשתוק — תראה את השכינה". שתק ונפטר.',
      memorySummary: 'כהן גדול, בעל המידות. "דיברה תורה כלשון בני אדם". נהרג על קידוש השם.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 21. Rabbi Meir
  const meir = await prisma.scholar.create({
    data: {
      slug: 'rabbi-meir',
      nameHe: 'רבי מאיר',
      alternateNames: ['רבי מאיר בעל הנס', 'מאיר'],
      period: 'TANNAIM',
      birthStart: 100,
      birthEnd: 120,
      deathStart: 160,
      deathEnd: 180,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי מאיר היה מגדולי התנאים בדור הרביעי, תלמידו של רבי עקיבא. נודע בחריפותו ובפלפולו, עד שאמרו "כל מקום שכתוב ׳אחרים אומרים׳ — זה רבי מאיר". אשתו הייתה ברוריה החכמה. גר צדק או בן גרים.',
      role: 'תנא, תלמיד רבי עקיבא',
      placeNotes: 'טבריה, אושא',
      featuredQuote:
        'כל העוסק בתורה לשמה — זוכה לדברים הרבה.',
      featuredStory:
        'ברוריה אשתו הייתה בתו של רבי חנניה בן תרדיון. כשאלישע בן אבויה (אחר) יצא לתרבות רעה, רבי מאיר המשיך ללמוד ממנו תורה. אמרו עליו: "רימון מצא — תוכו אכל, קליפתו זרק". היה ממשיך מסורתו של רבי עקיבא. שמועותיו מהוות יסוד למשנה.',
      memorySummary: '"מאיר עיני חכמים". תלמיד רבי עקיבא, בעלה של ברוריה.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 22. Rabbi Shimon bar Yochai
  const rashbi = await prisma.scholar.create({
    data: {
      slug: 'rabbi-shimon-bar-yochai',
      nameHe: 'רבי שמעון בר יוחאי',
      alternateNames: ['רשב"י', 'שמעון בן יוחאי'],
      period: 'TANNAIM',
      birthStart: 100,
      birthEnd: 120,
      deathStart: 160,
      deathEnd: 180,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי שמעון בר יוחאי היה מגדולי תלמידיו של רבי עקיבא, ומחבר ספר הזוהר על פי המסורת. התחבא במערה 13 שנה עם בנו רבי אלעזר מפני גזירות הרומאים, ושם עסקו בתורת הסוד. מגדולי המקובלים.',
      role: 'תנא, מקובל, תלמיד רבי עקיבא',
      placeNotes: 'פקיעין, מירון',
      featuredQuote:
        'כמה מעשיהם של צדיקים — מתורתו של רבי עקיבא.',
      featuredStory:
        'דיבר סרה במלכות הרומית. רבי יהודה אמר: "כמה נאים מעשיהם של אומה זו — תיקנו שווקים, תיקנו גשרים". רבי שמעון אמר: "כל מה שתיקנו לתועלתם תיקנו". הלשינו עליו וגזרו עליו מוות. ברח עם בנו למערה בפקיעין, שם התחבאו 13 שנה. חרוב ומעיין מים נוצרו להם בדרך נס. כשיצאו, ראה רבי שמעון אנשים חורשים וזורעים, ואמר: "מניחים חיי עולם ועוסקים בחיי שעה". כל מקום שהיו מסתכלים בו היה נשרף. יצאה בת קול: "להחריב עולמי יצאתם? חזרו למערתכם".',
      memorySummary: 'מחבר הזוהר, התחבא במערה 13 שנה. תלמיד רבי עקיבא.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 23. Rabbi Yehuda bar Ilai
  const yehudaIlai = await prisma.scholar.create({
    data: {
      slug: 'rabbi-yehuda-bar-ilai',
      nameHe: 'רבי יהודה בר אילעאי',
      alternateNames: ['רבי יהודה', 'יהודה בר אילעאי'],
      period: 'TANNAIM',
      birthStart: 100,
      birthEnd: 120,
      deathStart: 160,
      deathEnd: 180,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי יהודה בר אילעאי היה תנא בדור הרביעי, תלמידו של רבי עקיבא. משנת "סתם משנה — רבי מאיר, סתם תוספתא — רבי נחמיה, סתם ספרא — רבי יהודה". נודע כחכם המובהק מבין תלמידי רבי עקיבא.',
      role: 'תנא, תלמיד רבי עקיבא',
      placeNotes: 'אושא',
      featuredQuote:
        'הוי זהיר בתלמוד, ששגגת תלמוד עולה זדון.',
      featuredStory:
        'בכל מקום שנחלקו חכמים, הלכה כרבי יהודה. אמרו עליו: "כל מקום שרבי יהודה אומר ׳אימתי׳ — אינו אלא לפרש דברי חכמים". היה "ראש המדברים בכל מקום", כלומר נואם מוביל.',
      memorySummary: '"ראש המדברים בכל מקום". תלמיד רבי עקיבא. סתם ספרא — רבי יהודה.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 24. Rabbi Yose ben Chalafta
  const yoseChalafta = await prisma.scholar.create({
    data: {
      slug: 'rabbi-yose-ben-chalafta',
      nameHe: 'רבי יוסי בן חלפתא',
      alternateNames: ['רבי יוסי', 'יוסי בן חלפתא'],
      period: 'TANNAIM',
      birthStart: 100,
      birthEnd: 120,
      deathStart: 160,
      deathEnd: 180,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי יוסי בן חלפתא היה תנא בדור הרביעי, תלמידו של רבי עקיבא. נודע בעומק דעתו, עד שאמרו "רבי יוסי — נמוקו עמו". מחבר ספר "סדר עולם רבה" על סדר הדורות והכרונולוגיה המקראית.',
      role: 'תנא, תלמיד רבי עקיבא, מחבר סדר עולם',
      placeNotes: 'ציפורי',
      featuredQuote:
        'כל המכבד את התורה — גופו מכובד על הבריות.',
      featuredStory:
        'נודע בעומק נימוקיו. אמרו עליו: "רבי יוסי — נמוקו עמו". חיבר את "סדר עולם רבה" — חיבור הכרונולוגיה היהודי הקדום ביותר. היה מחמשת תלמידיו האחרונים של רבי עקיבא.',
      memorySummary: '"נמוקו עמו". מחבר סדר עולם רבה. תלמיד רבי עקיבא.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 25. Rabban Shimon ben Gamliel II
  const shimonGamlielII = await prisma.scholar.create({
    data: {
      slug: 'rabban-shimon-ben-gamliel-ii',
      nameHe: 'רבן שמעון בן גמליאל השני',
      alternateNames: ['רשב"ג', 'שמעון בן גמליאל'],
      period: 'TANNAIM',
      birthStart: 110,
      birthEnd: 130,
      deathStart: 170,
      deathEnd: 190,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבן שמעון בן גמליאל השני היה נשיא הסנהדרין בדור הרביעי, בנו של רבן גמליאל השני ואביו של רבי יהודה הנשיא. כיהן כנשיא באושא. נודע בהנהגתו בתקופת השבת הסנהדרין בגליל.',
      role: 'נשיא הסנהדרין',
      placeNotes: 'אושא',
      featuredQuote:
        'כל ימי גדלתי בין החכמים ולא מצאתי לגוף טוב אלא שתיקה; ולא המדרש עיקר אלא המעשה.',
      featuredStory:
        'כיהן כנשיא לאחר תקופת השמד והחורבן. קבע את מרכז הסנהדרין באושא. בתקופתו התכנסו חכמים לתקן תקנות ולהשלים את המשנה. היה נשיא לצד רבי מאיר, רבי יהודה, רבי יוסי ורבי שמעון.',
      memorySummary: 'נשיא באושא, אביו של רבי יהודה הנשיא. "לא המדרש עיקר אלא המעשה".',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 26. Rabbi Yehuda HaNasi
  const yehudaHanasi = await prisma.scholar.create({
    data: {
      slug: 'rabbi-yehuda-hanasi',
      nameHe: 'רבי יהודה הנשיא',
      alternateNames: ['רבי', 'יהודה הנשיא', 'רבנו הקדוש'],
      period: 'TANNAIM',
      birthStart: 135,
      birthEnd: 140,
      deathStart: 200,
      deathEnd: 220,
      dateConfidence: 'STRONG',
      biographyShort:
        'רבי יהודה הנשיא היה נשיא הסנהדרין, חותם המשנה. בנו של רבן שמעון בן גמליאל השני. ערך וחתם את המשנה בציפורי. נודע כגדול הדור, בעושר ובעוצמה פוליטית, וכונה פשוט "רבי".',
      role: 'נשיא הסנהדרין, חותם המשנה',
      placeNotes: 'ציפורי, בית שערים',
      featuredQuote:
        'איזו היא דרך ישרה שיבור לו האדם? כל שהיא תפארת לעושיה ותפארת לו מן האדם.',
      featuredStory:
        'ערך את המשנה וחתם אותה. כינס את כל המסורות וההלכות מכל התקופה התנאית וערך אותן לשישה סדרים. קבע שכל מחלוקת תובא לפניו להכרעה. היה מיודד עם הקיסר הרומי ("אנטונינוס"), שסייע לו. נקבר בבית שערים. אמר על עצמו: "לא נהניתי אפילו באצבע קטנה מן העולם הזה".',
      memorySummary: 'חותם המשנה. "רבנו הקדוש". ערך את שישה סדרי משנה.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // ══════════════════════════════════════════════════════════════
  // EXPANDED SCHOLARS — Amoraim
  // ══════════════════════════════════════════════════════════════

  // 27. Rav (Abba Arikha)
  const rav = await prisma.scholar.create({
    data: {
      slug: 'rav-abba-arikha',
      nameHe: 'רב (אבא אריכא)',
      alternateNames: ['רב', 'אבא אריכא', 'אבא בר איבו'],
      period: 'AMORAIM_BAVEL',
      birthStart: 160,
      birthEnd: 175,
      deathStart: 240,
      deathEnd: 250,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רב (אבא אריכא) היה האמורא הראשון בבבל, מייסד ישיבת סורא. תלמידו של רבי יהודה הנשיא בארץ ישראל. חזר לבבל והקים את הישיבה הגדולה בסורא, שהייתה מרכז התורה בבבל במשך כ-800 שנה.',
      role: 'אמורא, מייסד ישיבת סורא',
      placeNotes: 'סורא, בבל',
      featuredQuote:
        'מצוות בטלות לעתיד לבוא.',
      featuredStory:
        'ירד מארץ ישראל לבבל ומצא את יהודי בבל עמי ארצות. הקים את ישיבת סורא וקבע בה סדרי לימוד. תלמידו רב יהודה סיפר: "כל מה שאמרתי בפניכם — משל רב הוא". היה ידוע כמי ש"כל רז לא אניס ליה".',
      memorySummary: 'אמורא ראשון בבבל, מייסד ישיבת סורא. תלמיד רבי יהודה הנשיא.',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 28. Shmuel
  const shmuel = await prisma.scholar.create({
    data: {
      slug: 'shmuel-amora',
      nameHe: 'שמואל',
      alternateNames: ['שמואל ירחינאה', 'מר שמואל'],
      period: 'AMORAIM_BAVEL',
      birthStart: 170,
      birthEnd: 185,
      deathStart: 250,
      deathEnd: 257,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'שמואל היה אמורא בבלי, ראש ישיבת נהרדעא. תלמידו של רבי יהודה הנשיא (וגם של רב). נודע כמומחה בדיני ממונות וברפואה. קבע את הכלל "דינא דמלכותא דינא". היה חברו ובר הפלוגתא של רב.',
      role: 'אמורא, ראש ישיבת נהרדעא',
      placeNotes: 'נהרדעא, בבל',
      featuredQuote:
        'דינא דמלכותא דינא.',
      featuredStory:
        'היה רופא מומחה וידע לרפא מחלות עיניים. חברו של רב. חלקו בהלכות רבות, ובשלושה מקומות הלכה כרב באיסורים וכשמואל בדיני ממונות. קבע את העיקרון המהפכני "דינא דמלכותא דינא" — חוקי המלכות מחייבים גם מבחינה הלכתית.',
      memorySummary: 'ראש ישיבת נהרדעא. "דינא דמלכותא דינא". מומחה ברפואה ובדיני ממונות.',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 29. Rabbi Yochanan bar Nappacha
  const rabbiYochanan = await prisma.scholar.create({
    data: {
      slug: 'rabbi-yochanan-bar-nappacha',
      nameHe: 'רבי יוחנן (בר נפחא)',
      alternateNames: ['רבי יוחנן', 'יוחנן בר נפחא'],
      period: 'AMORAIM_ERETZ_YISRAEL',
      birthStart: 180,
      birthEnd: 200,
      deathStart: 279,
      deathEnd: 280,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבי יוחנן בר נפחא היה גדול אמוראי ארץ ישראל, ראש ישיבת טבריה. עמד בראש המרכז התורני בארץ ישראל במשך כ-60 שנה. נודע ביופיו המופלג. תלמידו המובהק של רבי ינאי, וגם תלמידו של רבי יהודה הנשיא.',
      role: 'אמורא, ראש ישיבת טבריה',
      placeNotes: 'טבריה, ציפורי',
      featuredQuote:
        'כל מקום שאתה מוצא גדולתו של הקב"ה — שם אתה מוצא ענוותנותו.',
      featuredStory:
        'נודע ביופיו המופלג. אמר על עצמו: "נשתייר ממני ממלוא חופניים יופי". היה מיודד עם ריש לקיש, שהפך לתלמידו-חברו. לאחר פטירת ריש לקיש, רבי יוחנן התגעגע אליו מאוד וחלה מרוב צער. ביום פטירתו של רבי יוחנן, אמרו: "אתמול בטלו שרביטי הזהורית והיום בטלו אושיות העולם".',
      memorySummary: 'גדול אמוראי ארץ ישראל. ראש ישיבת טבריה. חברו של ריש לקיש. נודע ביופיו.',
      status: 'PUBLISHED',
      empireId: romanEmpire.id,
    },
  });

  // 30. Rav Huna
  const ravHuna = await prisma.scholar.create({
    data: {
      slug: 'rav-huna',
      nameHe: 'רב הונא',
      alternateNames: ['הונא'],
      period: 'AMORAIM_BAVEL',
      birthStart: 200,
      birthEnd: 216,
      deathStart: 296,
      deathEnd: 297,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רב הונא היה ראש ישיבת סורא מדור שני של האמוראים בבבל, תלמידו של רב. כיהן כראש ישיבה ארבעים שנה. נודע בעשרו ובצדקתו.',
      role: 'אמורא, ראש ישיבת סורא',
      placeNotes: 'סורא, בבל',
      featuredQuote:
        'כל העוסק בתורה — הקב"ה עושה לו חפציו.',
      featuredStory:
        'היה עשיר גדול ועסק בצדקה. בכל ערב שבת היה שולח שליח לקנות את כל הירקות שנשארו לגננים ומשליכם לנהר, כדי שלא יפסידו הגננים ויתייאשו מלהביא לשוק. במותו, אמרו: "מה ארון הקודש עושה בבבל?" — והעלו את ארונו לקבורה בארץ ישראל.',
      memorySummary: 'ראש ישיבת סורא 40 שנה, תלמיד רב. עשיר וצדיק.',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 31. Rav Yehuda bar Yechezkel
  const ravYehuda = await prisma.scholar.create({
    data: {
      slug: 'rav-yehuda-bar-yechezkel',
      nameHe: 'רב יהודה בר יחזקאל',
      alternateNames: ['רב יהודה', 'יהודה בר יחזקאל'],
      period: 'AMORAIM_BAVEL',
      birthStart: 200,
      birthEnd: 220,
      deathStart: 297,
      deathEnd: 299,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רב יהודה בר יחזקאל היה ראש ישיבת פומבדיתא, מגדולי תלמידיו של רב. מייסד מרכז התורה בפומבדיתא שהתחרה בישיבת סורא. היה ידוע כמי ש"כשהיה לומד תורה — לא היה מרגיש בצער הגוף".',
      role: 'אמורא, מייסד ישיבת פומבדיתא',
      placeNotes: 'פומבדיתא, בבל',
      featuredQuote:
        'כל הדר בעיר שאין בה רופא — אינו בכלל שוטה.',
      featuredStory:
        'ייסד את ישיבת פומבדיתא, שהתחרתה בישיבת סורא. נודע בחריפותו — "מפומבדיתא ועד בי חוזאי — כולם תלמידי רב יהודה". תלמידו רבה ורב יוסף התחרו על ראשות הישיבה אחריו.',
      memorySummary: 'מייסד ישיבת פומבדיתא. תלמיד רב. חריף ובקי.',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 32. Rabbah bar Nachmani
  const rabbah = await prisma.scholar.create({
    data: {
      slug: 'rabbah-bar-nachmani',
      nameHe: 'רבה בר נחמני',
      alternateNames: ['רבה'],
      period: 'AMORAIM_BAVEL',
      birthStart: 260,
      birthEnd: 270,
      deathStart: 320,
      deathEnd: 330,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבה בר נחמני היה ראש ישיבת פומבדיתא, תלמידם של רב הונא ורב יהודה. נודע בכינוי "עוקר הרים" בזכות חריפותו ופלפולו. נפטר בעת שנאלץ לברוח מפני השלטון הסאסאני.',
      role: 'אמורא, ראש ישיבת פומבדיתא',
      placeNotes: 'פומבדיתא, בבל',
      featuredQuote:
        'הרוצה שיתחכם — ידרים; ושיעשיר — יצפין.',
      featuredStory:
        'רבה ורב יוסף התחרו על ראשות ישיבת פומבדיתא. שלחו לשאול את חכמי ארץ ישראל: "רבה ורב יוסף — מי קודם?" ענו: "רבה קודם — שהכל צריכים למרי חיטיא (בעל החיטים, כלומר בעל הבקיאות הרחבה)". בזמן שדן בהלכה, היה מעקר הרים וטוחנם זה בזה — פלפול עצום. ברח מפני השלטון ונפטר בסבך היער.',
      memorySummary: '"עוקר הרים". ראש ישיבת פומבדיתא. נודע בחריפותו.',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 33. Rav Yosef bar Chiya
  const ravYosef = await prisma.scholar.create({
    data: {
      slug: 'rav-yosef-bar-chiya',
      nameHe: 'רב יוסף בר חייא',
      alternateNames: ['רב יוסף', 'יוסף בר חייא'],
      period: 'AMORAIM_BAVEL',
      birthStart: 260,
      birthEnd: 270,
      deathStart: 323,
      deathEnd: 333,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רב יוסף בר חייא היה ראש ישיבת פומבדיתא, תלמידם של רב הונא ורב יהודה. נודע בכינוי "סיני" בזכות בקיאותו העצומה. התעוור בגיל מבוגר. שימש כראש ישיבה אחרי פטירת רבה.',
      role: 'אמורא, ראש ישיבת פומבדיתא',
      placeNotes: 'פומבדיתא, בבל',
      featuredQuote:
        'כל השוכח דבר אחד ממשנתו — מעלה עליו הכתוב כאילו מתחייב בנפשו.',
      featuredStory:
        'נודע כ"סיני" — בעל בקיאות עצומה במשניות וברייתות, בניגוד לרבה שהיה "עוקר הרים". התעוור. למרות זאת, המשיך ללמד וללמוד. היה עניו וסבלן. שימש כראש ישיבה לאחר פטירת רבה, אך נפטר כעבור שנתיים.',
      memorySummary: '"סיני" — בעל בקיאות עצומה. ראש ישיבת פומבדיתא. התעוור.',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 34. Abaye
  const abaye = await prisma.scholar.create({
    data: {
      slug: 'abaye',
      nameHe: 'אביי',
      alternateNames: ['אביי בר כייליל', 'נחמני'],
      period: 'AMORAIM_BAVEL',
      birthStart: 278,
      birthEnd: 280,
      deathStart: 338,
      deathEnd: 340,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'אביי היה ראש ישיבת פומבדיתא, תלמידם של רבה ורב יוסף. נודע כבר הפלוגתא של רבא. מחלוקותיהם ("הוויות אביי ורבא") מהוות את עיקר התלמוד הבבלי. ההלכה נפסקה כרבא ברוב המקרים, מלבד ששה מקרים (יע"ל קג"ם).',
      role: 'אמורא, ראש ישיבת פומבדיתא',
      placeNotes: 'פומבדיתא, בבל',
      featuredQuote:
        'לעולם יהא אדם ערום ביראה.',
      featuredStory:
        'גדל כיתום — אביו נפטר לפני לידתו ואמו נפטרה בלידתו. גידלה אותו אשה צדקת, ומכאן שמו "אביי" (אב-י׳). בר הפלוגתא הקבוע של רבא. ההלכה נפסקה כרבא ברוב המקרים, מלבד ששה מקרים (יע"ל קג"ם).',
      memorySummary: 'בר הפלוגתא של רבא. ראש ישיבת פומבדיתא. "הוויות אביי ורבא".',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 35. Rava
  const rava = await prisma.scholar.create({
    data: {
      slug: 'rava',
      nameHe: 'רבא',
      alternateNames: ['רבא בר יוסף בר חמא', 'רבא'],
      period: 'AMORAIM_BAVEL',
      birthStart: 280,
      birthEnd: 290,
      deathStart: 350,
      deathEnd: 352,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבא היה ראש ישיבת מחוזא, מגדולי אמוראי בבל. בר הפלוגתא של אביי. מחלוקותיהם ("הוויות אביי ורבא") מהוות את עיקר התלמוד הבבלי. ההלכה כמותו בכל מקום חוץ משישה מקרים. הקים את ישיבת מחוזא.',
      role: 'אמורא, ראש ישיבת מחוזא',
      placeNotes: 'מחוזא, בבל',
      featuredQuote:
        'כל ערום יעשה בדעת.',
      featuredStory:
        'חברו ובר הפלוגתא של אביי. למד אצל רבה ורב יוסף. הקים את ישיבת מחוזא. היה עשיר מאוד והשתמש בעושרו לצרכי ציבור. נודע בכושרו הרטורי והשכלתני. ההלכה כמותו בכל מקום מלבד שישה מקרים (יע"ל קג"ם). נחשב למכריע הגדול.',
      memorySummary: 'בר הפלוגתא של אביי. ראש ישיבת מחוזא. נפסקה הלכה כמותו.',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 36. Rav Ashi
  const ravAshi = await prisma.scholar.create({
    data: {
      slug: 'rav-ashi',
      nameHe: 'רב אשי',
      alternateNames: ['רב אשי'],
      period: 'AMORAIM_BAVEL',
      birthStart: 335,
      birthEnd: 340,
      deathStart: 427,
      deathEnd: 428,
      dateConfidence: 'STRONG',
      biographyShort:
        'רב אשי היה ראש ישיבת מתא מחסיא (סמוך לסורא) במשך כ-60 שנה. העורך הראשי של התלמוד הבבלי. יחד עם תלמידיו ובמיוחד רבינא, החל בעריכת התלמוד — מלאכה שהמשיכה אחריו.',
      role: 'אמורא, ראש ישיבת מתא מחסיא, עורך התלמוד הבבלי',
      placeNotes: 'מתא מחסיא, בבל',
      featuredQuote:
        'כל תלמיד חכם שאין תוכו כברו — אינו תלמיד חכם.',
      featuredStory:
        'כיהן כראש ישיבה 60 שנה. התחיל במפעל חייו — עריכת התלמוד הבבלי. הקדיש את חייו לאיסוף המסורות, המחלוקות וההלכות מהדורות שקדמו לו, ועריכתן לסדר שיטתי. העבודה נמשכה גם אחרי מותו על ידי תלמידיו.',
      memorySummary: 'עורך התלמוד הבבלי. ראש ישיבת מתא מחסיא 60 שנה.',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  // 37. Ravina
  const ravina = await prisma.scholar.create({
    data: {
      slug: 'ravina',
      nameHe: 'רבינא',
      alternateNames: ['רבינא בר רב הונא'],
      period: 'AMORAIM_BAVEL',
      birthStart: 370,
      birthEnd: 390,
      deathStart: 499,
      deathEnd: 500,
      dateConfidence: 'TRADITIONAL',
      biographyShort:
        'רבינא היה אמורא בבלי, תלמידו של רבא ורב אשי. נחשב לאחרון האמוראים ולחותם התלמוד הבבלי — "רבינא ורב אשי סוף הוראה". השלים את עריכת התלמוד.',
      role: 'אמורא, חותם התלמוד',
      placeNotes: 'מתא מחסיא, בבל',
      featuredQuote:
        'לעולם ילמד אדם תורה בדרך קצרה.',
      featuredStory:
        'המשיך את מפעל רב אשי בעריכת התלמוד. נחשב לאחרון האמוראים — "רבינא ורב אשי סוף הוראה". שנת פטירתו (ד׳ר"ס) נחשבת לסוף תקופת האמוראים ולתחילת תקופת הסבוראים.',
      memorySummary: 'אחרון האמוראים. חותם התלמוד. "רבינא ורב אשי — סוף הוראה".',
      status: 'PUBLISHED',
      empireId: sassanianEmpire.id,
    },
  });

  console.log(`  ✓ ${37} scholars (6 original + 31 expanded)`);

  // ══════════════════════════════════════════════════════════════
  // RELATIONSHIPS
  // ══════════════════════════════════════════════════════════════

  // Original 7 relationships
  const relsBase = await Promise.all([
    prisma.relationship.create({
      data: { fromScholarId: shimon.id, toScholarId: antignos.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'איגרת רב שרירא גאון' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: antignos.id, toScholarId: yoezer.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id },
    }),
    prisma.relationship.create({
      data: { fromScholarId: antignos.id, toScholarId: yochanan.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yoezer.id, toScholarId: yochanan.id, type: 'CHEVRUTA', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'זוג ראשון' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yoezer.id, toScholarId: yehoshua.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[0].id, notes: 'משנה אבות א, ד' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yochanan.id, toScholarId: nitai.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[0].id, notes: 'משנה אבות א, ד' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yehoshua.id, toScholarId: nitai.id, type: 'CHEVRUTA', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'זוג שני' },
    }),
  ]);

  // Expanded relationships — Zugot chains
  const relsExpanded = await Promise.all([
    // Yehoshua → Yehuda ben Tabbai (RAV)
    prisma.relationship.create({
      data: { fromScholarId: yehoshua.id, toScholarId: yehudaTabbai.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[6].id, notes: 'משנה אבות א, ח' },
    }),
    // Nitai → Shimon ben Shetach (RAV)
    prisma.relationship.create({
      data: { fromScholarId: nitai.id, toScholarId: shimonShetach.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[6].id, notes: 'משנה אבות א, ח' },
    }),
    // Yehuda + Shimon Shetach → CHEVRUTA (Zug #3)
    prisma.relationship.create({
      data: { fromScholarId: yehudaTabbai.id, toScholarId: shimonShetach.id, type: 'CHEVRUTA', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'זוג שלישי' },
    }),
    // Yehuda Tabbai → Shemaya (RAV)
    prisma.relationship.create({
      data: { fromScholarId: yehudaTabbai.id, toScholarId: shemaya.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[6].id, notes: 'משנה אבות א, י' },
    }),
    // Shimon Shetach → Avtalyon (RAV)
    prisma.relationship.create({
      data: { fromScholarId: shimonShetach.id, toScholarId: avtalyon.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[6].id, notes: 'משנה אבות א, י' },
    }),
    // Shemaya + Avtalyon → CHEVRUTA (Zug #4)
    prisma.relationship.create({
      data: { fromScholarId: shemaya.id, toScholarId: avtalyon.id, type: 'CHEVRUTA', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'זוג רביעי' },
    }),
    // Shemaya → Hillel (RAV)
    prisma.relationship.create({
      data: { fromScholarId: shemaya.id, toScholarId: hillel.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[6].id, notes: 'משנה אבות א, יב' },
    }),
    // Avtalyon → Shammai (RAV)
    prisma.relationship.create({
      data: { fromScholarId: avtalyon.id, toScholarId: shammai.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[6].id, notes: 'משנה אבות א, יב' },
    }),
    // Hillel + Shammai → CHEVRUTA (Zug #5)
    prisma.relationship.create({
      data: { fromScholarId: hillel.id, toScholarId: shammai.id, type: 'CHEVRUTA', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'זוג חמישי — בתי הלל ושמאי' },
    }),

    // Hillel → Rabban Gamliel HaZaken (family + student)
    prisma.relationship.create({
      data: { fromScholarId: hillel.id, toScholarId: gamlielHazaken.id, type: 'FAMILY', confidence: 'STRONG', sourceId: sources[1].id, notes: 'סב ונכד (דרך רבן שמעון בן הלל)' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: hillel.id, toScholarId: gamlielHazaken.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[2].id, notes: 'הלל מסר לרבן גמליאל' },
    }),
    // Hillel → Rabban Yochanan ben Zakkai (RAV)
    prisma.relationship.create({
      data: { fromScholarId: hillel.id, toScholarId: rybz.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'ריב"ז תלמיד הלל' },
    }),
    // Rabban Gamliel → Rabban Shimon ben Gamliel I (FAMILY + RAV)
    prisma.relationship.create({
      data: { fromScholarId: gamlielHazaken.id, toScholarId: shimonGamlielI.id, type: 'FAMILY', confidence: 'STRONG', sourceId: sources[1].id, notes: 'אב ובן' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: gamlielHazaken.id, toScholarId: shimonGamlielI.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id },
    }),

    // RYBZ → Rabbi Eliezer (RAV)
    prisma.relationship.create({
      data: { fromScholarId: rybz.id, toScholarId: eliezerHyrcanus.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[0].id, notes: 'משנה אבות ב, ח — מגדולי תלמידיו' },
    }),
    // RYBZ → Rabbi Yehoshua ben Chananya (RAV)
    prisma.relationship.create({
      data: { fromScholarId: rybz.id, toScholarId: yehoshuaChananya.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[0].id, notes: 'משנה אבות ב, ח' },
    }),
    // Rabbi Eliezer + Rabbi Yehoshua → CONTEMPORARY
    prisma.relationship.create({
      data: { fromScholarId: eliezerHyrcanus.id, toScholarId: yehoshuaChananya.id, type: 'CONTEMPORARY', confidence: 'TRADITIONAL', sourceId: sources[15].id, notes: 'חברים, נחלקו במחלוקת תנורו של עכנאי' },
    }),

    // Rabbi Yehoshua → Rabbi Akiva (RAV)
    prisma.relationship.create({
      data: { fromScholarId: yehoshuaChananya.id, toScholarId: akiva.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'רבי עקיבא תלמידו המובהק' },
    }),
    // Rabbi Eliezer → Rabbi Akiva (RAV)
    prisma.relationship.create({
      data: { fromScholarId: eliezerHyrcanus.id, toScholarId: akiva.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[16].id, notes: 'רבי עקיבא למד גם מרבי אליעזר' },
    }),

    // Rabbi Akiva → Rabbi Meir (RAV)
    prisma.relationship.create({
      data: { fromScholarId: akiva.id, toScholarId: meir.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[16].id, notes: 'מגדולי תלמידי רבי עקיבא בדור הרביעי' },
    }),
    // Rabbi Akiva → Rabbi Shimon bar Yochai (RAV)
    prisma.relationship.create({
      data: { fromScholarId: akiva.id, toScholarId: rashbi.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'תלמידו המובהק של רבי עקיבא בנגלה ובנסתר' },
    }),
    // Rabbi Akiva → Rabbi Yehuda bar Ilai (RAV)
    prisma.relationship.create({
      data: { fromScholarId: akiva.id, toScholarId: yehudaIlai.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'תלמידו של רבי עקיבא' },
    }),
    // Rabbi Akiva → Rabbi Yose ben Chalafta (RAV)
    prisma.relationship.create({
      data: { fromScholarId: akiva.id, toScholarId: yoseChalafta.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'מחמשת תלמידיו האחרונים' },
    }),
    // Rabbi Akiva → Rabbi Tarfon (CONTEMPORARY)
    prisma.relationship.create({
      data: { fromScholarId: akiva.id, toScholarId: tarfon.id, type: 'CONTEMPORARY', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'חברים, נחלקו בהלכה' },
    }),
    // Rabbi Akiva → Rabbi Yishmael (DISPUTANT)
    prisma.relationship.create({
      data: { fromScholarId: akiva.id, toScholarId: yishmael.id, type: 'DISPUTANT', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'נחלקו במידות שהתורה נדרשת בהן' },
    }),

    // The "five last students" group — CONTEMPORARY links
    prisma.relationship.create({
      data: { fromScholarId: meir.id, toScholarId: rashbi.id, type: 'CONTEMPORARY', confidence: 'TRADITIONAL', sourceId: sources[16].id, notes: 'חברים, תלמידי רבי עקיבא' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yehudaIlai.id, toScholarId: meir.id, type: 'CONTEMPORARY', confidence: 'TRADITIONAL', sourceId: sources[16].id },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yehudaIlai.id, toScholarId: rashbi.id, type: 'CONTEMPORARY', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'נחלקו בשבח מלכות רומי' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yoseChalafta.id, toScholarId: yehudaIlai.id, type: 'CONTEMPORARY', confidence: 'TRADITIONAL', sourceId: sources[16].id },
    }),

    // Rabban Shimon ben Gamliel II ← Nasi dynasty chain
    prisma.relationship.create({
      data: { fromScholarId: shimonGamlielI.id, toScholarId: shimonGamlielII.id, type: 'FAMILY', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'שושלת הנשיאות (דרך רבן גמליאל דיבנה)' },
    }),
    // Shimon ben Gamliel II → Rabbi Yehuda HaNasi (FAMILY + RAV)
    prisma.relationship.create({
      data: { fromScholarId: shimonGamlielII.id, toScholarId: yehudaHanasi.id, type: 'FAMILY', confidence: 'STRONG', sourceId: sources[1].id, notes: 'אב ובן' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: shimonGamlielII.id, toScholarId: yehudaHanasi.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[2].id, notes: 'הנשיאות עברה מאב לבן' },
    }),
    // Rabbi Meir & friends → Yehuda HaNasi (RAV)
    prisma.relationship.create({
      data: { fromScholarId: meir.id, toScholarId: yehudaHanasi.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'רבי למד מרבי מאיר' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: rashbi.id, toScholarId: yehudaHanasi.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yehudaIlai.id, toScholarId: yehudaHanasi.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'רבי למד מרבי יהודה' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: yoseChalafta.id, toScholarId: yehudaHanasi.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id },
    }),

    // ── Amoraim chains ──

    // Yehuda HaNasi → Rav (RAV)
    prisma.relationship.create({
      data: { fromScholarId: yehudaHanasi.id, toScholarId: rav.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'רב למד אצל רבי בארץ ישראל' },
    }),
    // Yehuda HaNasi → Shmuel (RAV)
    prisma.relationship.create({
      data: { fromScholarId: yehudaHanasi.id, toScholarId: shmuel.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'שמואל למד אצל רבי' },
    }),
    // Yehuda HaNasi → Rabbi Yochanan (RAV)
    prisma.relationship.create({
      data: { fromScholarId: yehudaHanasi.id, toScholarId: rabbiYochanan.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[21].id, notes: 'רבי יוחנן היה צעיר תלמידיו של רבי' },
    }),
    // Rav + Shmuel → CONTEMPORARY / DISPUTANT
    prisma.relationship.create({
      data: { fromScholarId: rav.id, toScholarId: shmuel.id, type: 'DISPUTANT', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'הלכה כרב באיסורים וכשמואל בדיני ממונות' },
    }),
    prisma.relationship.create({
      data: { fromScholarId: rav.id, toScholarId: shmuel.id, type: 'CONTEMPORARY', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'חברים וברי פלוגתא' },
    }),

    // Rav → Rav Huna (RAV)
    prisma.relationship.create({
      data: { fromScholarId: rav.id, toScholarId: ravHuna.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'ראש ישיבת סורא אחרי רב' },
    }),
    // Rav → Rav Yehuda (RAV)
    prisma.relationship.create({
      data: { fromScholarId: rav.id, toScholarId: ravYehuda.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'רב יהודה — תלמידו המובהק של רב' },
    }),
    // Rav Huna → Rabbah (RAV)
    prisma.relationship.create({
      data: { fromScholarId: ravHuna.id, toScholarId: rabbah.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'רבה למד אצל רב הונא' },
    }),
    // Rav Huna → Rav Yosef (RAV)
    prisma.relationship.create({
      data: { fromScholarId: ravHuna.id, toScholarId: ravYosef.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id },
    }),
    // Rav Yehuda → Rabbah (RAV)
    prisma.relationship.create({
      data: { fromScholarId: ravYehuda.id, toScholarId: rabbah.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: 'רבה תלמידו המובהק' },
    }),
    // Rav Yehuda → Rav Yosef (RAV)
    prisma.relationship.create({
      data: { fromScholarId: ravYehuda.id, toScholarId: ravYosef.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[8].id },
    }),
    // Rabbah + Rav Yosef → CONTEMPORARY
    prisma.relationship.create({
      data: { fromScholarId: rabbah.id, toScholarId: ravYosef.id, type: 'CONTEMPORARY', confidence: 'TRADITIONAL', sourceId: sources[8].id, notes: '"עוקר הרים" ו"סיני"' },
    }),

    // Rabbah → Abaye (RAV)
    prisma.relationship.create({
      data: { fromScholarId: rabbah.id, toScholarId: abaye.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[13].id, notes: 'אביי תלמידו של רבה' },
    }),
    // Rabbah → Rava (RAV)
    prisma.relationship.create({
      data: { fromScholarId: rabbah.id, toScholarId: rava.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[13].id, notes: 'רבא תלמידו של רבה' },
    }),
    // Rav Yosef → Abaye (RAV)
    prisma.relationship.create({
      data: { fromScholarId: ravYosef.id, toScholarId: abaye.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[13].id },
    }),
    // Rav Yosef → Rava (RAV)
    prisma.relationship.create({
      data: { fromScholarId: ravYosef.id, toScholarId: rava.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[13].id },
    }),
    // Abaye + Rava → DISPUTANT
    prisma.relationship.create({
      data: { fromScholarId: abaye.id, toScholarId: rava.id, type: 'DISPUTANT', confidence: 'TRADITIONAL', sourceId: sources[13].id, notes: '"הוויות אביי ורבא" — הלכה כרבא בר מיע"ל קג"ם' },
    }),

    // Rava → Rav Ashi (RAV — via tradition, generation gap covered)
    prisma.relationship.create({
      data: { fromScholarId: rava.id, toScholarId: ravAshi.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'רב אשי קיבל מרב פפא תלמיד רבא' },
    }),
    // Rav Ashi → Ravina (RAV)
    prisma.relationship.create({
      data: { fromScholarId: ravAshi.id, toScholarId: ravina.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'רבינא תלמידו של רב אשי, משלים עריכת התלמוד' },
    }),
  ]);

  console.log(`  ✓ ${relsBase.length + relsExpanded.length} relationships`);

  // ══════════════════════════════════════════════════════════════
  // SCHOLAR-SOURCES
  // ══════════════════════════════════════════════════════════════

  const scholarSourcesBase = [
    await prisma.scholarSource.create({
      data: { scholarId: shimon.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ב' },
    }),
    await prisma.scholarSource.create({
      data: { scholarId: shimon.id, sourceId: sources[3].id, relevance: 'ספר הקבלה לראב"ד' },
    }),
    await prisma.scholarSource.create({
      data: { scholarId: antignos.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ג' },
    }),
    await prisma.scholarSource.create({
      data: { scholarId: yoezer.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ד' },
    }),
    await prisma.scholarSource.create({
      data: { scholarId: yochanan.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ד' },
    }),
    await prisma.scholarSource.create({
      data: { scholarId: yehoshua.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ו' },
    }),
    await prisma.scholarSource.create({
      data: { scholarId: nitai.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ז' },
    }),
  ];

  const scholarSourcesExpanded = await Promise.all([
    // Zugot scholars
    prisma.scholarSource.create({ data: { scholarId: yehudaTabbai.id, sourceId: sources[6].id, relevance: 'משנה אבות א, ח' } }),
    prisma.scholarSource.create({ data: { scholarId: yehudaTabbai.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון' } }),
    prisma.scholarSource.create({ data: { scholarId: shimonShetach.id, sourceId: sources[6].id, relevance: 'משנה אבות א, ט' } }),
    prisma.scholarSource.create({ data: { scholarId: shimonShetach.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון' } }),
    prisma.scholarSource.create({ data: { scholarId: shemaya.id, sourceId: sources[6].id, relevance: 'משנה אבות א, י' } }),
    prisma.scholarSource.create({ data: { scholarId: shemaya.id, sourceId: sources[7].id, relevance: 'בבלי יומא עא:' } }),
    prisma.scholarSource.create({ data: { scholarId: avtalyon.id, sourceId: sources[6].id, relevance: 'משנה אבות א, יא' } }),
    prisma.scholarSource.create({ data: { scholarId: hillel.id, sourceId: sources[6].id, relevance: 'משנה אבות א, יב-יד' } }),
    prisma.scholarSource.create({ data: { scholarId: hillel.id, sourceId: sources[8].id, relevance: 'בבלי שבת לא.' } }),
    prisma.scholarSource.create({ data: { scholarId: shammai.id, sourceId: sources[6].id, relevance: 'משנה אבות א, טו' } }),

    // Tannaim
    prisma.scholarSource.create({ data: { scholarId: gamlielHazaken.id, sourceId: sources[6].id, relevance: 'משנה אבות א, טז' } }),
    prisma.scholarSource.create({ data: { scholarId: gamlielHazaken.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון' } }),
    prisma.scholarSource.create({ data: { scholarId: shimonGamlielI.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון' } }),
    prisma.scholarSource.create({ data: { scholarId: rybz.id, sourceId: sources[6].id, relevance: 'משנה אבות ב, ח' } }),
    prisma.scholarSource.create({ data: { scholarId: rybz.id, sourceId: sources[12].id, relevance: 'גיטין נו: — יציאה מירושלים' } }),
    prisma.scholarSource.create({ data: { scholarId: rybz.id, sourceId: sources[8].id, relevance: 'ראש השנה כט:, סוכה כח., בבא בתרא קלד.' } }),
    prisma.scholarSource.create({ data: { scholarId: eliezerHyrcanus.id, sourceId: sources[6].id, relevance: 'משנה אבות ב, י' } }),
    prisma.scholarSource.create({ data: { scholarId: eliezerHyrcanus.id, sourceId: sources[13].id, relevance: 'בבא מציעא נט: — תנורו של עכנאי' } }),
    prisma.scholarSource.create({ data: { scholarId: yehoshuaChananya.id, sourceId: sources[6].id, relevance: 'משנה אבות ב, יא' } }),
    prisma.scholarSource.create({ data: { scholarId: yehoshuaChananya.id, sourceId: sources[8].id, relevance: 'ראש השנה כה. — מחלוקת עם רבן גמליאל' } }),
    prisma.scholarSource.create({ data: { scholarId: akiva.id, sourceId: sources[6].id, relevance: 'משנה אבות ג, יז-יח' } }),
    prisma.scholarSource.create({ data: { scholarId: akiva.id, sourceId: sources[8].id, relevance: 'ברכות סא: — סריקת בשרו במסרקות' } }),
    prisma.scholarSource.create({ data: { scholarId: akiva.id, sourceId: sources[16].id, relevance: 'סנהדרין — הרוגי מלכות' } }),
    prisma.scholarSource.create({ data: { scholarId: tarfon.id, sourceId: sources[6].id, relevance: 'משנה אבות ב, טו' } }),
    prisma.scholarSource.create({ data: { scholarId: yishmael.id, sourceId: sources[8].id, relevance: 'ברכות ז. — כהונה גדולה' } }),
    prisma.scholarSource.create({ data: { scholarId: meir.id, sourceId: sources[6].id, relevance: 'משנה אבות ו, א' } }),
    prisma.scholarSource.create({ data: { scholarId: meir.id, sourceId: sources[8].id, relevance: 'חגיגה טו: — "רימון מצא"' } }),
    prisma.scholarSource.create({ data: { scholarId: rashbi.id, sourceId: sources[8].id, relevance: 'שבת לג: — 13 שנים במערה' } }),
    prisma.scholarSource.create({ data: { scholarId: yehudaIlai.id, sourceId: sources[6].id, relevance: 'משנה אבות — "הוי זהיר בתלמוד"' } }),
    prisma.scholarSource.create({ data: { scholarId: yehudaIlai.id, sourceId: sources[8].id, relevance: 'שבת לג:' } }),
    prisma.scholarSource.create({ data: { scholarId: yoseChalafta.id, sourceId: sources[6].id, relevance: 'משנה אבות — "כל המכבד את התורה"' } }),
    prisma.scholarSource.create({ data: { scholarId: shimonGamlielII.id, sourceId: sources[6].id, relevance: 'משנה אבות א, יז' } }),
    prisma.scholarSource.create({ data: { scholarId: yehudaHanasi.id, sourceId: sources[6].id, relevance: 'משנה אבות ב, א' } }),
    prisma.scholarSource.create({ data: { scholarId: yehudaHanasi.id, sourceId: sources[8].id, relevance: 'כתובות קג: — פטירתו' } }),
    prisma.scholarSource.create({ data: { scholarId: yehudaHanasi.id, sourceId: sources[2].id, relevance: 'הקדמת הרמב"ם למשנה' } }),

    // Amoraim
    prisma.scholarSource.create({ data: { scholarId: rav.id, sourceId: sources[8].id, relevance: 'ברכות, שבת — תלמידי רב' } }),
    prisma.scholarSource.create({ data: { scholarId: rav.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון — ייסוד ישיבת סורא' } }),
    prisma.scholarSource.create({ data: { scholarId: shmuel.id, sourceId: sources[8].id, relevance: 'בבא קמא קיג: — דינא דמלכותא' } }),
    prisma.scholarSource.create({ data: { scholarId: shmuel.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון' } }),
    prisma.scholarSource.create({ data: { scholarId: rabbiYochanan.id, sourceId: sources[21].id, relevance: 'תלמוד ירושלמי — ראש ישיבת טבריה' } }),
    prisma.scholarSource.create({ data: { scholarId: rabbiYochanan.id, sourceId: sources[13].id, relevance: 'בבא מציעא פד. — ריש לקיש' } }),
    prisma.scholarSource.create({ data: { scholarId: ravHuna.id, sourceId: sources[8].id, relevance: 'ברכות, שבת, עירובין' } }),
    prisma.scholarSource.create({ data: { scholarId: ravHuna.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון' } }),
    prisma.scholarSource.create({ data: { scholarId: ravYehuda.id, sourceId: sources[8].id, relevance: 'בבלי — תלמידו המובהק של רב' } }),
    prisma.scholarSource.create({ data: { scholarId: ravYehuda.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון — ייסוד פומבדיתא' } }),
    prisma.scholarSource.create({ data: { scholarId: rabbah.id, sourceId: sources[8].id, relevance: 'בבא מציעא פו. — עוקר הרים' } }),
    prisma.scholarSource.create({ data: { scholarId: rabbah.id, sourceId: sources[13].id, relevance: 'בבא מציעא — פלפולו' } }),
    prisma.scholarSource.create({ data: { scholarId: ravYosef.id, sourceId: sources[8].id, relevance: 'בבלי — סיני' } }),
    prisma.scholarSource.create({ data: { scholarId: abaye.id, sourceId: sources[8].id, relevance: 'הוויות אביי ורבא' } }),
    prisma.scholarSource.create({ data: { scholarId: abaye.id, sourceId: sources[13].id, relevance: 'בבא מציעא — מחלוקות' } }),
    prisma.scholarSource.create({ data: { scholarId: rava.id, sourceId: sources[8].id, relevance: 'בבא בתרא כב. — ייסוד מחוזא' } }),
    prisma.scholarSource.create({ data: { scholarId: ravAshi.id, sourceId: sources[13].id, relevance: 'בבא מציעא פו. — סוף הוראה' } }),
    prisma.scholarSource.create({ data: { scholarId: ravAshi.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון — עריכת התלמוד' } }),
    prisma.scholarSource.create({ data: { scholarId: ravina.id, sourceId: sources[1].id, relevance: 'איגרת רב שרירא גאון — חותם התלמוד' } }),
    prisma.scholarSource.create({ data: { scholarId: ravina.id, sourceId: sources[13].id, relevance: 'סוף הוראה' } }),
  ]);
  console.log(`  ✓ ${scholarSourcesBase.length + scholarSourcesExpanded.length} scholar-sources`);

  // ══════════════════════════════════════════════════════════════
  // SCHOLAR-PLACES
  // ══════════════════════════════════════════════════════════════

  const scholarPlacesBase = [
    await prisma.scholarPlace.create({ data: { scholarId: shimon.id, placeId: places[0].id, notes: 'שירת בבית המקדש' } }),
    await prisma.scholarPlace.create({ data: { scholarId: antignos.id, placeId: places[0].id } }),
    await prisma.scholarPlace.create({ data: { scholarId: yoezer.id, placeId: places[0].id } }),
    await prisma.scholarPlace.create({ data: { scholarId: yochanan.id, placeId: places[0].id } }),
    await prisma.scholarPlace.create({ data: { scholarId: yehoshua.id, placeId: places[0].id } }),
  ];

  const scholarPlacesExpanded = await Promise.all([
    // Zugot
    prisma.scholarPlace.create({ data: { scholarId: yehudaTabbai.id, placeId: places[0].id, notes: 'ירושלים — מושב הסנהדרין' } }),
    prisma.scholarPlace.create({ data: { scholarId: shimonShetach.id, placeId: places[0].id, notes: 'ירושלים — מושב הסנהדרין' } }),
    prisma.scholarPlace.create({ data: { scholarId: shemaya.id, placeId: places[0].id } }),
    prisma.scholarPlace.create({ data: { scholarId: avtalyon.id, placeId: places[0].id } }),
    prisma.scholarPlace.create({ data: { scholarId: hillel.id, placeId: places[0].id, notes: 'עלה מבבל לירושלים' } }),
    prisma.scholarPlace.create({ data: { scholarId: shammai.id, placeId: places[0].id } }),

    // Tannaim
    prisma.scholarPlace.create({ data: { scholarId: gamlielHazaken.id, placeId: places[0].id, notes: 'סנהדרין בירושלים' } }),
    prisma.scholarPlace.create({ data: { scholarId: shimonGamlielI.id, placeId: places[0].id, notes: 'נהרג בחורבן ירושלים' } }),
    prisma.scholarPlace.create({ data: { scholarId: rybz.id, placeId: places[0].id, notes: 'ירושלים — למד ולימד' } }),
    prisma.scholarPlace.create({ data: { scholarId: rybz.id, placeId: places[1].id, notes: 'מייסד מרכז יבנה' } }),
    prisma.scholarPlace.create({ data: { scholarId: eliezerHyrcanus.id, placeId: places[10].id, notes: 'לוד — מרכז תורתו' } }),
    prisma.scholarPlace.create({ data: { scholarId: yehoshuaChananya.id, placeId: places[15].id, notes: 'פקיעין — מקום מושבו' } }),
    prisma.scholarPlace.create({ data: { scholarId: akiva.id, placeId: places[11].id, notes: 'בני ברק — ישיבתו' } }),
    prisma.scholarPlace.create({ data: { scholarId: akiva.id, placeId: places[12].id, notes: 'קיסריה — מקום הירצחו' } }),
    prisma.scholarPlace.create({ data: { scholarId: tarfon.id, placeId: places[10].id, notes: 'לוד — מקום מושבו' } }),
    prisma.scholarPlace.create({ data: { scholarId: yishmael.id, placeId: places[0].id, notes: 'כיהן ככהן גדול' } }),
    prisma.scholarPlace.create({ data: { scholarId: meir.id, placeId: places[3].id, notes: 'טבריה — ישיבתו' } }),
    prisma.scholarPlace.create({ data: { scholarId: rashbi.id, placeId: places[15].id, notes: 'פקיעין — המערה' } }),
    prisma.scholarPlace.create({ data: { scholarId: yehudaIlai.id, placeId: places[8].id, notes: 'אושא — מרכז הסנהדרין' } }),
    prisma.scholarPlace.create({ data: { scholarId: yoseChalafta.id, placeId: places[2].id, notes: 'ציפורי — מושבו' } }),
    prisma.scholarPlace.create({ data: { scholarId: shimonGamlielII.id, placeId: places[8].id, notes: 'אושא — מושב הנשיא' } }),
    prisma.scholarPlace.create({ data: { scholarId: yehudaHanasi.id, placeId: places[2].id, notes: 'ציפורי — ערך וחתם את המשנה' } }),
    prisma.scholarPlace.create({ data: { scholarId: yehudaHanasi.id, placeId: places[9].id, notes: 'בית שערים — מקום קבורתו' } }),

    // Amoraim
    prisma.scholarPlace.create({ data: { scholarId: rav.id, placeId: places[4].id, notes: 'סורא — מייסד הישיבה' } }),
    prisma.scholarPlace.create({ data: { scholarId: shmuel.id, placeId: places[6].id, notes: 'נהרדעא — ראש הישיבה' } }),
    prisma.scholarPlace.create({ data: { scholarId: rabbiYochanan.id, placeId: places[3].id, notes: 'טבריה — ראש הישיבה' } }),
    prisma.scholarPlace.create({ data: { scholarId: ravHuna.id, placeId: places[4].id, notes: 'סורא — ראש הישיבה 40 שנה' } }),
    prisma.scholarPlace.create({ data: { scholarId: ravYehuda.id, placeId: places[5].id, notes: 'פומבדיתא — מייסד הישיבה' } }),
    prisma.scholarPlace.create({ data: { scholarId: rabbah.id, placeId: places[5].id, notes: 'פומבדיתא — ראש הישיבה' } }),
    prisma.scholarPlace.create({ data: { scholarId: ravYosef.id, placeId: places[5].id, notes: 'פומבדיתא — ראש הישיבה' } }),
    prisma.scholarPlace.create({ data: { scholarId: abaye.id, placeId: places[5].id, notes: 'פומבדיתא — ראש הישיבה' } }),
    prisma.scholarPlace.create({ data: { scholarId: rava.id, placeId: places[7].id, notes: 'מחוזא — ייסד את הישיבה' } }),
    prisma.scholarPlace.create({ data: { scholarId: ravAshi.id, placeId: places[14].id, notes: 'מתא מחסיא — ראש הישיבה ועריכת התלמוד' } }),
    prisma.scholarPlace.create({ data: { scholarId: ravina.id, placeId: places[14].id, notes: 'מתא מחסיא — השלמת התלמוד' } }),
  ]);
  console.log(`  ✓ ${scholarPlacesBase.length + scholarPlacesExpanded.length} scholar-places`);

  // ══════════════════════════════════════════════════════════════
  // SCHOLAR-TAGS
  // ══════════════════════════════════════════════════════════════

  const scholarTagsAll = await Promise.all([
    // Tags for original scholars
    prisma.scholarTag.create({ data: { scholarId: shimon.id, tagId: tags[0].id } }),
    prisma.scholarTag.create({ data: { scholarId: yoezer.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: yochanan.id, tagId: tags[2].id } }),
    prisma.scholarTag.create({ data: { scholarId: yehoshua.id, tagId: tags[0].id } }),
    prisma.scholarTag.create({ data: { scholarId: yehoshua.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: nitai.id, tagId: tags[2].id } }),

    // Zugot tags
    prisma.scholarTag.create({ data: { scholarId: yehudaTabbai.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: shimonShetach.id, tagId: tags[2].id } }),
    prisma.scholarTag.create({ data: { scholarId: shemaya.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: avtalyon.id, tagId: tags[2].id } }),
    prisma.scholarTag.create({ data: { scholarId: hillel.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: shammai.id, tagId: tags[2].id } }),

    // Tannaim tags
    prisma.scholarTag.create({ data: { scholarId: gamlielHazaken.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: shimonGamlielI.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: shimonGamlielI.id, tagId: tags[4].id } }),
    prisma.scholarTag.create({ data: { scholarId: rybz.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: eliezerHyrcanus.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: yehoshuaChananya.id, tagId: tags[2].id } }),
    prisma.scholarTag.create({ data: { scholarId: yehoshuaChananya.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: akiva.id, tagId: tags[4].id } }),
    prisma.scholarTag.create({ data: { scholarId: akiva.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: tarfon.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: yishmael.id, tagId: tags[4].id } }),
    prisma.scholarTag.create({ data: { scholarId: yishmael.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: meir.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: rashbi.id, tagId: tags[5].id } }),
    prisma.scholarTag.create({ data: { scholarId: rashbi.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: yehudaIlai.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: yoseChalafta.id, tagId: tags[7].id } }),
    prisma.scholarTag.create({ data: { scholarId: shimonGamlielII.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: yehudaHanasi.id, tagId: tags[1].id } }),
    prisma.scholarTag.create({ data: { scholarId: yehudaHanasi.id, tagId: tags[6].id } }),
    prisma.scholarTag.create({ data: { scholarId: yehudaHanasi.id, tagId: tags[7].id } }),

    // Amoraim tags
    prisma.scholarTag.create({ data: { scholarId: rav.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: rav.id, tagId: tags[8].id } }),
    prisma.scholarTag.create({ data: { scholarId: rav.id, tagId: tags[9].id } }),
    prisma.scholarTag.create({ data: { scholarId: shmuel.id, tagId: tags[8].id } }),
    prisma.scholarTag.create({ data: { scholarId: shmuel.id, tagId: tags[11].id } }),
    prisma.scholarTag.create({ data: { scholarId: rabbiYochanan.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: rabbiYochanan.id, tagId: tags[8].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravHuna.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravHuna.id, tagId: tags[9].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravYehuda.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravYehuda.id, tagId: tags[10].id } }),
    prisma.scholarTag.create({ data: { scholarId: rabbah.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: rabbah.id, tagId: tags[10].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravYosef.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravYosef.id, tagId: tags[10].id } }),
    prisma.scholarTag.create({ data: { scholarId: abaye.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: abaye.id, tagId: tags[10].id } }),
    prisma.scholarTag.create({ data: { scholarId: rava.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: rava.id, tagId: tags[8].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravAshi.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravAshi.id, tagId: tags[12].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravina.id, tagId: tags[3].id } }),
    prisma.scholarTag.create({ data: { scholarId: ravina.id, tagId: tags[12].id } }),
  ]);
  console.log(`  ✓ ${scholarTagsAll.length} scholar-tags`);

  // ── Admin User ──
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash: hash,
      name: 'מנהל המערכת',
      role: 'admin',
    },
  });
  console.log('  ✓ admin user created');

  console.log('\n✅ Seed complete!');
  console.log(`   Scholars: 37 (Shimon HaTzadik → Ravina)`);
  console.log(`   Periods: 6 | Empires: 5 | Places: 16 | Sources: 24 | Tags: 13`);
  console.log(`   Relationships: ${relsBase.length + relsExpanded.length}`);
  console.log(`   Scholar-Sources: ${scholarSourcesBase.length + scholarSourcesExpanded.length}`);
  console.log(`   Scholar-Places: ${scholarPlacesBase.length + scholarPlacesExpanded.length}`);
  console.log(`   Scholar-Tags: ${scholarTagsAll.length}`);
  console.log(`   Admin: admin / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
