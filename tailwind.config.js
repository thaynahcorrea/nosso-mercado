/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A2E2C',
        teal: { DEFAULT: '#2A9D8F', soft: '#E8F5F3', mist: '#EDF4F3' },
        slatey: '#6B8280',
        blueStore: '#457B9D',
        coral: '#E76F51',
        green2: '#52B788',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(42,157,143,0.08)',
        sheet: '0 -6px 30px rgba(0,0,0,0.18)',
        fab: '0 4px 18px rgba(42,157,143,0.45)',
      },
    },
  },
  plugins: [],
};
