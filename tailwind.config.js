module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#3b82f6', // blue-500
          dark: '#1e40af', // blue-800
          50: '#eff6ff',
          100: '#dbeafe',
        },
        secondary: {
          DEFAULT: '#6366f1', // indigo-500
          light: '#818cf8', // indigo-400
          dark: '#3730a3', // indigo-800
          50: '#eef2ff',
          100: '#e0e7ff',
        },
        info: {
          DEFAULT: '#0ea5e9', // sky-500
          light: '#38bdf8', // sky-400
          dark: '#0369a1', // sky-800
        },
        success: {
          DEFAULT: '#22c55e', // green-500
          light: '#4ade80', // green-400
          dark: '#166534', // green-800
          50: '#f0fdf4',
          100: '#dcfce7',
        },
        warning: {
          DEFAULT: '#f59e42', // orange-400
          light: '#fbbf24', // orange-300
          dark: '#b45309', // orange-800
          50: '#fff7ed',
          100: '#ffedd5',
        },
        danger: {
          DEFAULT: '#ef4444', // red-500
          light: '#f87171', // red-400
          dark: '#991b1b', // red-800
          50: '#fef2f2',
          100: '#fee2e2',
        },
        neutral: {
          DEFAULT: '#64748b', // slate-500
          light: '#cbd5e1', // slate-300
          dark: '#1e293b', // slate-800
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        background: {
          light: '#f8fafc', // slate-50
          dark: '#0f172a', // slate-900
        },
        card: {
          light: '#fff',
          dark: '#1e293b',
        },
        border: {
          light: '#e5e7eb', // gray-200
          dark: '#334155', // slate-700
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(30, 41, 59, 0.08)',
        'card-dark': '0 2px 8px 0 rgba(15, 23, 42, 0.32)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
