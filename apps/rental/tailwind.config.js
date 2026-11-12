/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    fontFamily: {
      sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        // 配色取自一間北歐風租屋：白牆為主、胡桃木地板當主色、炭灰文字；
        // cream 是燕麥色地毯，只當重點（選中的項目、可編輯的文字框、備註）；
        // 狀態色：檯燈暖黃、灰藍綠牆、植物綠、霧玫瑰、暖灰
        ink: '#2E3033',
        sub: '#74716B',
        line: '#E4E0D8',
        ground: '#FFFFFF',
        cream: { DEFAULT: '#F3F0EA', deep: '#E9E4DA' },
        card: { line: '#ECE8E1' },
        brand: { DEFAULT: '#6B4A36', dark: '#553A2A', soft: '#EFE7E0' },
        status: {
          not_contacted: '#C98A2E',
          contacted: '#3F6A73',
          viewed: '#5B7F52',
          favorite: '#B8556B',
          rented: '#9A958D',
        },
        warn: { bg: '#FEF3C7', text: '#8A3B0A' },
      },
    },
  },
  plugins: [],
};
