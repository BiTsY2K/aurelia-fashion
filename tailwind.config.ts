import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: '#FAF7F2', soft: '#FBF9F6', dim: '#F2EDE5' }, // 60% — background
        carbon: { DEFAULT: '#1A1A1A', soft: '#222222', muted: '#6B6660' },  // 30% — structure & text
        champagne: { DEFAULT: '#C8A96A', deep: '#B6925A' },   // 10% — hook accent
        terracotta: { DEFAULT: '#A36A52' },
        blush: { DEFAULT: '#EBD9D1', soft: '#F6ECE7' }, // pastel wash for bespoke + kids surfaces
        rose: { DEFAULT: '#B76E79', deep: '#9A5762' },  // rose-gold secondary accent
        line: '#E7E0D6', // hairline dividers on ivory
      },
      fontFamily: {
        // wired to next/font CSS variables in layout.tsx
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // editorial display scale
        'display-xl': ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      maxWidth: { content: '1280px' },
      borderRadius: { pill: '9999px', card: '20px' },
      boxShadow: {
        soft: '0 1px 2px rgba(26,26,26,0.04), 0 8px 24px rgba(26,26,26,0.05)',
        lift: '0 8px 40px rgba(26,26,26,0.10)',
      },
      transitionTimingFunction: { brand: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: { 'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both' },
    },
  },
  plugins: [],
};

export default config;
