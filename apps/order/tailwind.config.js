/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec,test}.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        status: {
          pending: '#B7791F',
          'pending-bg': '#FEF3E2',
          paid: '#2F855A',
          'paid-bg': '#E6F4EA',
          cancelled: '#C53030',
          'cancelled-bg': '#FBEAEA',
        },
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
