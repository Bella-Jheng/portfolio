/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    fontFamily: {
      sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        // 配色取自一間北歐風租屋：純白為主、胡桃木地板當主色、炭灰文字；
        // 除了輸入框之外，底色一律純白；區塊靠細邊框區分。cream 只用在輸入框（淺灰底，提示可以打字）；
        // 狀態色：檯燈暖黃、灰藍綠牆、植物綠、霧玫瑰、暖灰
        ink: '#2E3033',
        sub: '#707070',
        line: '#E2E2E2',
        ground: '#FFFFFF',
        cream: { DEFAULT: '#F4F4F4', deep: '#EAEAEA' },
        card: { line: '#EAEAEA' },
        brand: { DEFAULT: '#6B4A36', dark: '#553A2A', soft: '#F4F4F4' },
        status: {
          not_contacted: '#C98A2E',
          contacted: '#3F6A73',
          viewed: '#5B7F52',
          rented: '#9A958D',
        },
        warn: { bg: '#FEF3C7', text: '#8A3B0A' },
      },
    },
  },
  plugins: [],
};
