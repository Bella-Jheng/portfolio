/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    fontFamily: {
      sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        // 白色為主：頁面、卡片、按鈕都是白色；奶油色只當重點（選中的項目、可編輯的文字框、備註）；
        // 主色陶土紅、文字深可可色
        ink: '#3A2A20',
        sub: '#7D6B5D',
        line: '#E8DCCB',
        ground: '#FFFFFF',
        cream: { DEFAULT: '#FBF5EC', deep: '#F4EADB' },
        card: { line: '#F0E6D8' },
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
