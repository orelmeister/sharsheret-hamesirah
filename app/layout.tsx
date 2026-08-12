import type { Metadata } from 'next';
import { Frank_Ruhl_Libre, Assistant } from 'next/font/google';
import './globals.css';

// Display: Frank Ruhl Libre — the classic Hebrew book/newspaper serif
const display = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['500', '700', '900'],
  variable: '--font-secular',
  display: 'swap',
});

// Body/UI: Assistant — clean modern Hebrew sans
const body = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heebo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'שרשרת המסירה — מאגר ידע על חכמי המשנה והתלמוד',
    template: '%s | שרשרת המסירה',
  },
  description:
    'מאגר ידע אינטראקטיבי על חכמי המשנה והתלמוד — משמעון הצדיק ועד חתימת התלמוד. חקור את שרשרת המסירה, קשרי רב-תלמיד, צירי זמן ומקורות.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'שרשרת המסירה',
  },
};

export const viewport = {
  themeColor: '#0f6b63',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans bg-parchment text-ink antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
