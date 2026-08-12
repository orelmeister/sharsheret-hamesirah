'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PERIODS, type PeriodKey } from '@/lib/constants';

interface ScholarFormData {
  nameHe: string;
  slug: string;
  alternateNames: string[];
  period: string;
  generationId: string;
  birthStart: string;
  birthEnd: string;
  deathStart: string;
  deathEnd: string;
  dateConfidence: string;
  biographyShort: string;
  role: string;
  placeNotes: string;
  featuredQuote: string;
  featuredStory: string;
  memorySummary: string;
  empireId: string;
  status: string;
}

const emptyForm: ScholarFormData = {
  nameHe: '',
  slug: '',
  alternateNames: [],
  period: 'TANNAIM',
  generationId: '',
  birthStart: '',
  birthEnd: '',
  deathStart: '',
  deathEnd: '',
  dateConfidence: 'UNKNOWN',
  biographyShort: '',
  role: '',
  placeNotes: '',
  featuredQuote: '',
  featuredStory: '',
  memorySummary: '',
  empireId: '',
  status: 'DRAFT',
};

const DATE_CONFIDENCE_OPTIONS = [
  { value: 'CERTAIN', label: 'ודאי' },
  { value: 'STRONG', label: 'מבוסס היטב' },
  { value: 'TRADITIONAL', label: 'מסורתי' },
  { value: 'DISPUTED', label: 'שנוי במחלוקת' },
  { value: 'UNKNOWN', label: 'לא ידוע' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'טיוטה' },
  { value: 'REVIEW', label: 'בסקירה' },
  { value: 'APPROVED', label: 'מאושר' },
  { value: 'PUBLISHED', label: 'פורסם' },
  { value: 'ARCHIVED', label: 'בארכיון' },
];

function parseIntOrNull(val: string): number | null {
  if (val === '' || val === '-') return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function buildSlug(name: string): string {
  return name
    .trim()
    .replace(/[^\w\s\u0590-\u05FF-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export default function AdminScholarEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [form, setForm] = useState<ScholarFormData>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [alternateNamesInput, setAlternateNamesInput] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  // Load existing scholar
  useEffect(() => {
    if (isNew) return;

    async function load() {
      try {
        const res = await fetch(`/api/admin/scholars/${id}`);
        if (!res.ok) throw new Error('Not found');
        const { data } = await res.json();

        setForm({
          nameHe: data.nameHe || '',
          slug: data.slug || '',
          alternateNames: data.alternateNames || [],
          period: data.period || 'TANNAIM',
          generationId: data.generationId || '',
          birthStart: data.birthStart?.toString() || '',
          birthEnd: data.birthEnd?.toString() || '',
          deathStart: data.deathStart?.toString() || '',
          deathEnd: data.deathEnd?.toString() || '',
          dateConfidence: data.dateConfidence || 'UNKNOWN',
          biographyShort: data.biographyShort || '',
          role: data.role || '',
          placeNotes: data.placeNotes || '',
          featuredQuote: data.featuredQuote || '',
          featuredStory: data.featuredStory || '',
          memorySummary: data.memorySummary || '',
          empireId: data.empireId || '',
          status: data.status || 'DRAFT',
        });
        setAutoSlug(false);
      } catch {
        setError('החכם לא נמצא');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, isNew]);

  function updateField(field: keyof ScholarFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Auto-generate slug from nameHe
      if (field === 'nameHe' && autoSlug) {
        next.slug = buildSlug(value);
      }

      return next;
    });
  }

  function addAlternateName() {
    const trimmed = alternateNamesInput.trim();
    if (!trimmed) return;
    if (form.alternateNames.includes(trimmed)) return;
    setForm((prev) => ({
      ...prev,
      alternateNames: [...prev.alternateNames, trimmed],
    }));
    setAlternateNamesInput('');
  }

  function removeAlternateName(index: number) {
    setForm((prev) => ({
      ...prev,
      alternateNames: prev.alternateNames.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      nameHe: form.nameHe,
      slug: form.slug,
      alternateNames: form.alternateNames,
      period: form.period,
      generationId: form.generationId || null,
      birthStart: parseIntOrNull(form.birthStart),
      birthEnd: parseIntOrNull(form.birthEnd),
      deathStart: parseIntOrNull(form.deathStart),
      deathEnd: parseIntOrNull(form.deathEnd),
      dateConfidence: form.dateConfidence,
      biographyShort: form.biographyShort || null,
      role: form.role || null,
      placeNotes: form.placeNotes || null,
      featuredQuote: form.featuredQuote || null,
      featuredStory: form.featuredStory || null,
      memorySummary: form.memorySummary || null,
      empireId: form.empireId || null,
      status: form.status,
    };

    try {
      const url = isNew ? '/api/admin/scholars' : `/api/admin/scholars/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          typeof data.error === 'string'
            ? data.error
            : 'שגיאה בשמירת החכם — בדוק את הנתונים'
        );
        return;
      }

      router.push('/admin/scholars');
      router.refresh();
    } catch {
      setError('שגיאת רשת — נסה שוב');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-stone-400">טוען...</p>
      </div>
    );
  }

  const isBCE = form.birthStart !== '' && parseInt(form.birthStart, 10) < 0;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            {isNew ? 'חכם חדש' : `עריכת חכם: ${form.nameHe || '...'}`}
          </h1>
          <p className="text-stone-500 mt-1">
            {isNew ? 'יצירת חכם חדש במאגר' : 'עדכון פרטי החכם'}
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/scholars')}
          className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800 transition-colors"
        >
          ← חזרה לרשימה
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
            {error}
          </div>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-bold text-stone-800 border-b border-stone-100 pb-2">
            פרטים בסיסיים
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">
                שם החכם <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nameHe}
                onChange={(e) => updateField('nameHe', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent
                           text-right"
                dir="auto"
                placeholder="לדוגמה: רבי עקיבא"
              />
            </div>

            {/* Slug */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-stone-700">
                  מזהה (slug) <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-stone-500">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => setAutoSlug(e.target.checked)}
                    className="rounded border-stone-300"
                  />
                  יצירה אוטומטית מהשם
                </label>
              </div>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setAutoSlug(false); updateField('slug', e.target.value); }}
                required
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent
                           font-mono text-sm text-left"
                dir="ltr"
                placeholder="rebbe-akiva"
              />
            </div>

            {/* Period */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                תקופה <span className="text-red-500">*</span>
              </label>
              <select
                value={form.period}
                onChange={(e) => updateField('period', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {Object.entries(PERIODS).map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                סטטוס
              </label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                תפקיד
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent
                           text-right"
                dir="auto"
                placeholder="כהן גדול / נשיא / ראש ישיבה"
              />
            </div>

            {/* Place notes */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                מקומות
              </label>
              <input
                type="text"
                value={form.placeNotes}
                onChange={(e) => updateField('placeNotes', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent
                           text-right"
                dir="auto"
                placeholder="ירושלים, טבריה"
              />
            </div>
          </div>

          {/* Alternate names */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              שמות חלופיים
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={alternateNamesInput}
                onChange={(e) => setAlternateNamesInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAlternateName(); } }}
                className="flex-1 px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent
                           text-right"
                dir="auto"
                placeholder="הוסף שם חלופי..."
              />
              <button
                type="button"
                onClick={addAlternateName}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700
                           rounded-lg text-sm transition-colors"
              >
                + הוסף
              </button>
            </div>
            {form.alternateNames.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.alternateNames.map((name, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                               bg-accent-soft text-accent-dark text-sm border border-accent/30"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeAlternateName(i)}
                      className="text-accent hover:text-accent-dark text-xs ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-bold text-stone-800 border-b border-stone-100 pb-2">
            תיארוך
          </h2>
          <p className="text-xs text-stone-400 -mt-2">
            ערכים שליליים = לפני הספירה (BCE). לדוגמה: 350- = 350 לפנה״ס.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Birth start */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                לידה (מ-)
              </label>
              <input
                type="number"
                value={form.birthStart}
                onChange={(e) => updateField('birthStart', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent text-left"
                dir="ltr"
                placeholder="למשל -350"
              />
            </div>

            {/* Birth end */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                לידה (עד)
              </label>
              <input
                type="number"
                value={form.birthEnd}
                onChange={(e) => updateField('birthEnd', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent text-left"
                dir="ltr"
                placeholder="למשל -300"
              />
            </div>

            {/* Death start */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                פטירה (מ-)
              </label>
              <input
                type="number"
                value={form.deathStart}
                onChange={(e) => updateField('deathStart', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent text-left"
                dir="ltr"
                placeholder="למשל -270"
              />
            </div>

            {/* Death end */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                פטירה (עד)
              </label>
              <input
                type="number"
                value={form.deathEnd}
                onChange={(e) => updateField('deathEnd', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-accent text-left"
                dir="ltr"
                placeholder="למשל -250"
              />
            </div>
          </div>

          {/* Date confidence */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              רמת ודאות התיארוך
            </label>
            <select
              value={form.dateConfidence}
              onChange={(e) => updateField('dateConfidence', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {DATE_CONFIDENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-bold text-stone-800 border-b border-stone-100 pb-2">
            תוכן
          </h2>

          {/* Biography short */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              ביוגרפיה קצרה
            </label>
            <textarea
              value={form.biographyShort}
              onChange={(e) => updateField('biographyShort', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-accent
                         text-right resize-y"
              dir="auto"
            />
          </div>

          {/* Featured quote */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              ציטוט מרכזי
            </label>
            <textarea
              value={form.featuredQuote}
              onChange={(e) => updateField('featuredQuote', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-accent
                         text-right resize-y"
              dir="auto"
            />
          </div>

          {/* Featured story */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              סיפור מרכזי
            </label>
            <textarea
              value={form.featuredStory}
              onChange={(e) => updateField('featuredStory', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-accent
                         text-right resize-y"
              dir="auto"
            />
          </div>

          {/* Memory summary */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              תקציר זיכרון (״נודע במיוחד בזכות״)
            </label>
            <textarea
              value={form.memorySummary}
              onChange={(e) => updateField('memorySummary', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-accent
                         text-right resize-y"
              dir="auto"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-accent hover:bg-accent-dark disabled:bg-accent/50
                       text-white font-medium rounded-lg transition-colors
                       focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            {saving ? 'שומר...' : isNew ? 'צור חכם' : 'שמור שינויים'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/scholars')}
            className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700
                       font-medium rounded-lg transition-colors"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
