import type { Metadata } from 'next';
import { Heebo, Secular_One } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

const secular = Secular_One({
  weight: '400',
  subsets: ['hebrew', 'latin'],
  variable: '--font-secular',
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
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'שרשרת המסירה',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${secular.variable}`}>
      <body className="font-sans bg-stone-50 text-stone-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
