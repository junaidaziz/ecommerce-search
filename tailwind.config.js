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
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#3b82f6', // blue-500
          dark: '#1e40af', // blue-800
        },
        secondary: {
          DEFAULT: '#6366f1', // indigo-500
          light: '#818cf8', // indigo-400
          dark: '#3730a3', // indigo-800
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
        },
        warning: {
          DEFAULT: '#f59e42', // orange-400
          light: '#fbbf24', // orange-300
          dark: '#b45309', // orange-800
        },
        danger: {
          DEFAULT: '#ef4444', // red-500
          light: '#f87171', // red-400
          dark: '#991b1b', // red-800
        },
        neutral: {
          DEFAULT: '#64748b', // slate-500
          light: '#cbd5e1', // slate-200
          dark: '#1e293b', // slate-800
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
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
          primary: '#10b981', // Emerald green
          'primary-focus': '#059669',
          'primary-content': '#ffffff',
          secondary: '#6366f1', // Indigo
          'secondary-focus': '#4f46e5',
          'secondary-content': '#ffffff',
          accent: '#f59e0b', // Amber
          'accent-focus': '#d97706',
          'accent-content': '#ffffff',
          success: '#10b981', // Emerald
          'success-content': '#ffffff',
          warning: '#f59e0b', // Amber
          'warning-content': '#ffffff',
          error: '#ef4444', // Red
          'error-content': '#ffffff',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          primary: '#10b981', // Emerald green
          'primary-focus': '#059669',
          'primary-content': '#ffffff',
          secondary: '#6366f1', // Indigo
          'secondary-focus': '#4f46e5',
          'secondary-content': '#ffffff',
          accent: '#f59e0b', // Amber
          'accent-focus': '#d97706',
          'accent-content': '#ffffff',
          success: '#10b981', // Emerald
          'success-content': '#ffffff',
          warning: '#f59e0b', // Amber
          'warning-content': '#ffffff',
          error: '#ef4444', // Red
          'error-content': '#ffffff',
        },
      },
    ],
  },
};
