/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        wellness: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        calm: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        warm: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 118, 110, 0.08)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.08), 0 16px 40px rgba(15, 118, 110, 0.12)',
        nav: '0 1px 0 rgba(15, 118, 110, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)',
      },
      backgroundImage: {
        'mesh-gradient':
          'radial-gradient(at 40% 20%, rgba(20, 184, 166, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(245, 158, 11, 0.08) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
