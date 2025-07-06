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
        primary: '#10b981', // Emerald 500
        accent: '#6366f1',  // Indigo 500
        background: '#f1f5f9', // Slate 100
        secondary: '#f59e42', // Orange 400
        text: '#0f172a', // Slate 900
        // Custom button colors
        'btn-primary': {
          DEFAULT: '#10b981', // Emerald green
          hover: '#059669',
          focus: '#047857',
        },
        'btn-secondary': {
          DEFAULT: '#6366f1', // Indigo
          hover: '#4f46e5',
          focus: '#4338ca',
        },
        'btn-accent': {
          DEFAULT: '#f59e0b', // Amber
          hover: '#d97706',
          focus: '#b45309',
        },
        'btn-success': {
          DEFAULT: '#10b981', // Emerald
          hover: '#059669',
          focus: '#047857',
        },
        'btn-warning': {
          DEFAULT: '#f59e0b', // Amber
          hover: '#d97706',
          focus: '#b45309',
        },
        'btn-error': {
          DEFAULT: '#ef4444', // Red
          hover: '#dc2626',
          focus: '#b91c1c',
        },
      },
    },
  },
  plugins: [require('daisyui')],
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
