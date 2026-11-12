/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    fontFamily: {
      sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        ink: '#17202B',
        sub: '#5B6573',
        line: '#D5DAE0',
        ground: '#F4F6F8',
        brand: { DEFAULT: '#0F766E', dark: '#115E59', soft: '#E6F4F1' },
        status: {
          contacting: '#2563EB',
          viewed: '#0F766E',
          favorite: '#DB2777',
          rented: '#6B7480',
        },
        warn: { bg: '#FEF3C7', text: '#8A3B0A' },
      },
    },
  },
  plugins: [],
};
