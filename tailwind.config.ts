import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-secular)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Period colors from spec
        ansheiKnesset: '#2d8a4e',   // Green - אנשי כנסת הגדולה
        zugot: '#2563eb',            // Blue - הזוגות
        tannaim: '#d4a017',          // Gold - תנאים
        amoraimIsrael: '#ea580c',    // Orange - אמוראי ארץ ישראל
        amoraimBavel: '#dc2626',     // Red - אמוראי בבל
        savoraim: '#7c3aed',         // Purple - סוף התלמוד

        // UI colors (RTL-friendly)
        background: '#fafaf9',
        foreground: '#1c1917',
        card: '#ffffff',
        'card-foreground': '#1c1917',
        muted: '#f5f5f4',
        'muted-foreground': '#78716c',
        border: '#e7e5e4',
        primary: '#92400e',
        'primary-foreground': '#fef3c7',
        secondary: '#f5f5f4',
        'secondary-foreground': '#1c1917',
        accent: '#fef3c7',
        'accent-foreground': '#92400e',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
