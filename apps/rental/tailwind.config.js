/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    fontFamily: {
      sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        // 暖色系：白色底，需要突出的卡片、按鈕、標籤用奶油色，主色是陶土紅、文字是深可可色
        ink: '#3A2A20',
        sub: '#7D6B5D',
        line: '#E8DCCB',
        ground: '#FFFFFF',
        cream: { DEFAULT: '#FBF5EC', deep: '#F4EADB' },
        brand: { DEFAULT: '#C2643A', dark: '#A34F2B', soft: '#F8E6D9' },
        status: {
          not_contacted: '#D97706',
          contacted: '#3B6EA8',
          viewed: '#5A8A4F',
          favorite: '#D9467A',
          rented: '#9C8B7D',
        },
        warn: { bg: '#FEF3C7', text: '#8A3B0A' },
      },
    },
  },
  plugins: [],
};
