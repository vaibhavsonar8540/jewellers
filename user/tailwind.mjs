/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../shared/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        rosegold: {
          50: '#fff5f5',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        luxury: {
          dark: '#0b0f19',
          card: '#111827',
          accent: '#d4af37',
          border: '#1f2937',
        },
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addUtilities }) {
      addComponents({
        '.btn-gold': {
          backgroundColor: '#d97706',
          color: '#ffffff',
          fontWeight: '600',
          padding: '0.625rem 1.25rem',
          borderRadius: '0.5rem',
          transition: 'all 0.2s ease-in-out',
          boxShadow: '0 4px 14px 0 rgba(217, 119, 6, 0.39)',
          '&:hover': {
            backgroundColor: '#b45309',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px 0 rgba(217, 119, 6, 0.45)',
          },
        },
        '.btn-outline-gold': {
          borderWidth: '1.5px',
          borderColor: '#d97706',
          color: '#b45309',
          fontWeight: '600',
          padding: '0.625rem 1.25rem',
          borderRadius: '0.5rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#fffbeb',
            borderColor: '#b45309',
            color: '#78350f',
          },
        },
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(229, 231, 235, 0.8)',
          borderRadius: '0.75rem',
        },
        '.glass-card-dark': {
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(31, 41, 55, 0.8)',
          borderRadius: '0.75rem',
        },
        '.badge-gold': {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontSize: '0.75rem',
          fontWeight: '600',
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          border: '1px solid #fde68a',
        },
      });

      addUtilities({
        '.text-gold-gradient': {
          backgroundImage: 'linear-gradient(to right, #b45309, #f59e0b, #d97706)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.bg-gold-gradient': {
          backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
        },
        '.gold-border': {
          borderColor: '#fcd34d',
        },
      });
    }),
  ],
};
