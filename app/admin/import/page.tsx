'use client';

import { useState, useRef } from 'react';
import { PERIODS, type PeriodKey } from '@/lib/constants';

interface PreviewScholar {
  nameHe: string;
  slug: string;
  period: string;
  role?: string;
  status?: string;
}

interface ImportResult {
  imported: number;
  duplicates: number;
  duplicateSlugs: string[];
  scholars: Array<{ id: string; slug: string; nameHe: string }>;
}

const EXAMPLE_JSON = `{
  "scholars": [
    {
      "nameHe": "הלל הזקן",
      "slug": "hillel-hazaken",
      "period": "TANNAIM",
      "birthStart": -110,
      "birthEnd": -70,
      "deathStart": 10,
      "deathEnd": 20,
      "dateConfidence": "TRADITIONAL",
      "role": "נשיא הסנהדרין",
      "placeNotes": "ירושלים",
      "biographyShort": "הלל הזקן היה נשיא הסנהדרין..."
    }
  ]
}`;

export default function AdminImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewScholar[] | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [validating, setValidating] = useState(false);

  function resetState() {
    setPreview(null);
    setResult(null);
    setError('');
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    resetState();
    setValidating(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        setJsonText(text);
        const data = JSON.parse(text);

        if (!data.scholars || !Array.isArray(data.scholars)) {
          setError('הקובץ חייב להכיל מערך "scholars"');
          return;
        }

        if (data.scholars.length === 0) {
          setError('לא נמצאו חכמים בקובץ');
          return;
        }

        // Validate structure
        const previewData: PreviewScholar[] = data.scholars.map((s: Record<string, unknown>) => ({
          nameHe: String(s.nameHe || ''),
          slug: String(s.slug || ''),
          period: String(s.period || ''),
          role: s.role ? String(s.role) : undefined,
          status: s.status ? String(s.status) : 'DRAFT',
        }));

        // Basic validation
        const invalid = previewData.findIndex((s) => !s.nameHe || !s.slug || !s.period);
        if (invalid >= 0) {
          setError(`חכם #${invalid + 1}: חסר nameHe, slug או period`);
          return;
        }

        setPreview(previewData);
      } catch {
        setError('הקובץ אינו JSON תקין');
      } finally {
        setValidating(false);
      }
    };
    reader.readAsText(file);
  }

  function handlePasteCheck() {
    resetState();
    setValidating(true);

    try {
      const data = JSON.parse(jsonText);

      if (!data.scholars || !Array.isArray(data.scholars)) {
        setError('ה-JSON חייב להכיל מערך "scholars"');
        return;
      }

      if (data.scholars.length === 0) {
        setError('לא נמצאו חכמים ב-JSON');
        return;
      }

      const previewData: PreviewScholar[] = data.scholars.map((s: Record<string, unknown>) => ({
        nameHe: String(s.nameHe || ''),
        slug: String(s.slug || ''),
        period: String(s.period || ''),
        role: s.role ? String(s.role) : undefined,
        status: s.status ? String(s.status) : 'DRAFT',
      }));

      const invalid = previewData.findIndex((s) => !s.nameHe || !s.slug || !s.period);
      if (invalid >= 0) {
        setError(`חכם #${invalid + 1}: חסר nameHe, slug או period`);
        return;
      }

      setPreview(previewData);
    } catch {
      setError('ה-JSON אינו תקין');
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (!preview) return;

    setImporting(true);
    setError('');

    try {
      const data = JSON.parse(jsonText);
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resultData = await res.json();

      if (!res.ok) {
        setError(resultData.error || 'שגיאה בייבוא');
        return;
      }

      setResult(resultData.data);
      setPreview(null);
    } catch {
      setError('שגיאת רשת — נסה שוב');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">ייבוא חכמים</h1>
        <p className="text-stone-500 mt-1">
          ייבוא חכמים מקובץ JSON למאגר. המזהה (slug) חייב להיות ייחודי.
        </p>
      </div>

      {/* Upload / Paste area */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-bold text-stone-800">העלאת קובץ</h2>

        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="block w-full text-sm text-stone-600
                       file:ml-4 file:py-2 file:px-4 file:rounded-lg
                       file:border-0 file:text-sm file:font-medium
                       file:bg-accent-soft file:text-accent-dark
                       hover:file:bg-accent-soft file:cursor-pointer
                       file:transition-colors"
          />
        </div>

        <div className="border-t border-stone-200 pt-4">
          <p className="text-sm font-medium text-stone-600 mb-2">
            או הדבק JSON ידנית:
          </p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white
                       focus:outline-none focus:ring-2 focus:ring-accent
                       font-mono text-xs text-left resize-y"
            dir="ltr"
            placeholder={EXAMPLE_JSON}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handlePasteCheck}
              disabled={validating || !jsonText.trim()}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:bg-stone-100
                         disabled:opacity-50 text-stone-700 rounded-lg text-sm font-medium
                         transition-colors"
            >
              {validating ? 'בודק...' : '🔍 בדיקת JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Example format */}
      <details className="bg-stone-50 rounded-xl border border-stone-200 p-4">
        <summary className="text-sm font-medium text-stone-600 cursor-pointer">
          📋 דוגמה למבנה הקובץ
        </summary>
        <pre className="mt-3 text-xs font-mono text-stone-700 bg-stone-100 rounded-lg p-4 overflow-x-auto text-left" dir="ltr">
          {EXAMPLE_JSON}
        </pre>
      </details>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h2 className="font-bold text-stone-800">
              תצוגה מקדימה ({preview.length} חכמים)
            </h2>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 bg-accent hover:bg-accent-dark disabled:bg-accent/50
                         text-white font-medium rounded-lg text-sm transition-colors"
            >
              {importing ? 'מייבא...' : `📥 יבא ${preview.length} חכמים`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="text-right px-4 py-2 font-medium">#</th>
                  <th className="text-right px-4 py-2 font-medium">שם</th>
                  <th className="text-right px-4 py-2 font-medium">מזהה</th>
                  <th className="text-right px-4 py-2 font-medium">תקופה</th>
                  <th className="text-right px-4 py-2 font-medium">תפקיד</th>
                  <th className="text-right px-4 py-2 font-medium">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((s, i) => {
                  const periodInfo = PERIODS[s.period as PeriodKey];
                  return (
                    <tr key={i} className="border-b border-stone-100">
                      <td className="px-4 py-2 text-stone-400">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-stone-800">{s.nameHe}</td>
                      <td className="px-4 py-2 font-mono text-xs text-stone-500">{s.slug}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${periodInfo?.bgClass || 'bg-stone-100 text-stone-600'}`}>
                          {periodInfo?.label || s.period}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-stone-600">{s.role || '—'}</td>
                      <td className="px-4 py-2 text-stone-600 text-xs">{s.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-bold text-stone-800">תוצאות הייבוא</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700">{result.imported}</p>
              <p className="text-sm text-emerald-600">חכמים יובאו בהצלחה</p>
            </div>
            <div className="bg-accent-soft rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-accent-dark">{result.duplicates}</p>
              <p className="text-sm text-accent-dark">חכמים כפולים (דולגו)</p>
            </div>
          </div>

          {result.scholars.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-stone-700 mb-2">חכמים שיובאו:</h3>
              <div className="flex flex-wrap gap-2">
                {result.scholars.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700
                               text-xs border border-emerald-200"
                  >
                    {s.nameHe}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.duplicateSlugs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-stone-700 mb-2">מזהים כפולים שדולגו:</h3>
              <div className="flex flex-wrap gap-2">
                {result.duplicateSlugs.map((slug) => (
                  <span
                    key={slug}
                    className="px-2.5 py-1 rounded-full bg-accent-soft text-accent-dark
                               text-xs border border-accent/30 font-mono"
                  >
                    {slug}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
