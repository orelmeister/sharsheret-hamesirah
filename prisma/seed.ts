import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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
  console.log(`  ✓ ${6} scholars`);

  // ── Relationships ──
  const rels = await Promise.all([
    // Shimon → Antignos (RAV)
    prisma.relationship.create({
      data: { fromScholarId: shimon.id, toScholarId: antignos.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'איגרת רב שרירא גאון' },
    }),
    // Antignos → Yosei ben Yoezer (RAV)
    prisma.relationship.create({
      data: { fromScholarId: antignos.id, toScholarId: yoezer.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id },
    }),
    // Antignos → Yosei ben Yochanan (RAV)
    prisma.relationship.create({
      data: { fromScholarId: antignos.id, toScholarId: yochanan.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[1].id },
    }),
    // Yoezer + Yochanan → CHEVRUTA
    prisma.relationship.create({
      data: { fromScholarId: yoezer.id, toScholarId: yochanan.id, type: 'CHEVRUTA', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'זוג ראשון' },
    }),
    // Yoezer → Yehoshua (RAV)
    prisma.relationship.create({
      data: { fromScholarId: yoezer.id, toScholarId: yehoshua.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[0].id, notes: 'משנה אבות א, ד' },
    }),
    // Yochanan → Nitai (RAV)
    prisma.relationship.create({
      data: { fromScholarId: yochanan.id, toScholarId: nitai.id, type: 'RAV', confidence: 'TRADITIONAL', sourceId: sources[0].id, notes: 'משנה אבות א, ד' },
    }),
    // Yehoshua + Nitai → CHEVRUTA
    prisma.relationship.create({
      data: { fromScholarId: yehoshua.id, toScholarId: nitai.id, type: 'CHEVRUTA', confidence: 'TRADITIONAL', sourceId: sources[1].id, notes: 'זוג שני' },
    }),
  ]);
  console.log(`  ✓ ${rels.length} relationships`);

  // ── Scholar-Sources ──
  await prisma.scholarSource.create({
    data: { scholarId: shimon.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ב' },
  });
  await prisma.scholarSource.create({
    data: { scholarId: shimon.id, sourceId: sources[3].id, relevance: 'ספר הקבלה לראב"ד' },
  });
  await prisma.scholarSource.create({
    data: { scholarId: antignos.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ג' },
  });
  await prisma.scholarSource.create({
    data: { scholarId: yoezer.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ד' },
  });
  await prisma.scholarSource.create({
    data: { scholarId: yochanan.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ד' },
  });
  await prisma.scholarSource.create({
    data: { scholarId: yehoshua.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ו' },
  });
  await prisma.scholarSource.create({
    data: { scholarId: nitai.id, sourceId: sources[0].id, relevance: 'משנה אבות א, ז' },
  });
  console.log('  ✓ scholar-sources linked');

  // ── Scholar-Places ──
  await prisma.scholarPlace.create({ data: { scholarId: shimon.id, placeId: places[0].id, notes: 'שירת בבית המקדש' } });
  await prisma.scholarPlace.create({ data: { scholarId: antignos.id, placeId: places[0].id } });
  await prisma.scholarPlace.create({ data: { scholarId: yoezer.id, placeId: places[0].id } });
  await prisma.scholarPlace.create({ data: { scholarId: yochanan.id, placeId: places[0].id } });
  await prisma.scholarPlace.create({ data: { scholarId: yehoshua.id, placeId: places[0].id } });
  console.log('  ✓ scholar-places linked');

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
  console.log(`   Scholars: 6 (Shimon HaTzadik → Nitai HaArbeli)`);
  console.log(`   Periods: 6 | Empires: 5 | Places: 12 | Sources: 6 | Tags: 6`);
  console.log(`   Relationships: ${rels.length}`);
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
