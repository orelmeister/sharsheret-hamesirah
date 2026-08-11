import { Header } from '@/components/layout/Header';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-stone-800 mb-6">אודות ומתודולוגיה</h1>

        <section className="space-y-6 text-stone-700 leading-relaxed">
          <div className="scholar-card">
            <h2 className="font-display text-xl text-stone-800 mb-3">מהי שרשרת המסירה?</h2>
            <p>
              שרשרת המסירה היא מיזם קוד פתוח להנגשת תולדות חכמי ישראל — מאנשי כנסת הגדולה ועד חתימת התלמוד.
              המטרה היא ליצור מאגר ידע אינטראקטיבי שבו המשתמש יכול להתחיל בשמעון הצדיק ולעבור דרך שרשרת
              המסירה — מרב לתלמיד, מחברותא לבר פלוגתא — עד רב אשי ורבינא.
            </p>
          </div>

          <div className="scholar-card">
            <h2 className="font-display text-xl text-stone-800 mb-3">עקרונות מתודולוגיים</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>כל תוכן חייב להיות טקסט אמיתי — לא תמונות</li>
              <li>אין להציג עובדה ביוגרפית או היסטורית כוודאית ללא מקור</li>
              <li>מבחינים בין מקור חז"ל, ראשונים/אחרונים, מקור היסטורי חיצוני ומסקנת מערכת</li>
              <li>במחלוקת — מציגים את הדעות ולא מכריעים</li>
              <li>אין להמציא שנים, רבנים, תלמידים, קשרים או מאורעות</li>
              <li>מידע שאינו ידוע מסומן "לא ידוע ממקור מוסמך"</li>
            </ul>
          </div>

          <div className="scholar-card">
            <h2 className="font-display text-xl text-stone-800 mb-3">מקורות</h2>
            <p>
              המקורות העיקריים כוללים: משנה, תוספתא, תלמוד בבלי, תלמוד ירושלמי, מדרשי חז"ל,
              איגרת רב שרירא גאון, סדר עולם, הקדמות הרמב"ם, ספר הקבלה, ספר יוחסין, סדר הדורות, שם הגדולים.
            </p>
            <p className="mt-2">
              הטקסטים מסופקים באדיבות{' '}
              <a href="https://www.sefaria.org" className="text-amber-700 hover:underline" target="_blank" rel="noopener noreferrer">
                ספריא (Sefaria)
              </a>
              .
            </p>
          </div>

          <div className="scholar-card">
            <h2 className="font-display text-xl text-stone-800 mb-3">קוד פתוח</h2>
            <p>
              הקוד זמין ב-{' '}
              <a href="https://github.com/orelmeister/sharsheret-hamesirah" className="text-amber-700 hover:underline" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              {' '}תחת רישיון MIT. מוזמנים לתרום, לתקן ולהוסיף תוכן.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
