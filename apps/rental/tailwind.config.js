/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    fontFamily: {
      sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        // 暖色系：像家一樣的奶油白底、陶土紅屋頂、深可可色文字
        ink: '#3A2A20',
        sub: '#7D6B5D',
        line: '#E8DCCB',
        ground: '#FBF5EC',
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
