import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-secular)', 'Georgia', 'serif'],
      },
      colors: {
        // ── Manuscript / Beit Midrash palette ──
        parchment: { DEFAULT: '#f5f0e6', dark: '#ebe3d2' },
        surface: '#fffdf8',
        ink: { DEFAULT: '#211d18', soft: '#4a443b', muted: '#8a8172' },
        line: '#e4dccb',
        accent: { DEFAULT: '#0f6b63', dark: '#0a504a', soft: '#dcede9' },

        // ── Period pigments (muted, manuscript — no neon, no purple) ──
        period: {
          anshei: '#5f7d54',        // olive
          zugot: '#3d5a8a',         // indigo
          tannaim: '#a8792c',       // ochre
          'amoraim-ey': '#b0603a',  // terracotta
          'amoraim-bavel': '#9e3b3b', // madder
          savoraim: '#4b5266',      // ink-slate (was purple)
        },

        // Legacy names kept, remapped to new pigments
        ansheiKnesset: '#5f7d54',
        zugot: '#3d5a8a',
        tannaim: '#a8792c',
        amoraimIsrael: '#b0603a',
        amoraimBavel: '#9e3b3b',
        savoraim: '#4b5266',

        // Semantic UI (teal-based, replaces the amber defaults)
        background: '#f5f0e6',
        foreground: '#211d18',
        card: '#fffdf8',
        'card-foreground': '#211d18',
        muted: '#efe8da',
        'muted-foreground': '#8a8172',
        border: '#e4dccb',
        primary: '#0f6b63',
        'primary-foreground': '#ffffff',
        secondary: '#efe8da',
        'secondary-foreground': '#211d18',
        accent2: '#dcede9',
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(33,29,24,0.05)',
        'card-hover': '0 8px 30px -12px rgba(33,29,24,0.25)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
