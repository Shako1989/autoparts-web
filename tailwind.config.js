/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#e31b23',
          dark: '#c4151c',
          soft: '#fde8e9',
        },
        navy: {
          DEFAULT: '#0f172a',
          deep: '#0a1020',
          line: '#1e293b',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px -12px rgba(15, 23, 42, 0.25)',
        hero: '0 24px 60px -20px rgba(2, 6, 23, 0.6)',
      },
    },
  },
  plugins: [],
};
