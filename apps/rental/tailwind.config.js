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
      // 動畫：統一在這裡定義，畫面元件用 animate-* 套用；系統開啟「減少動態效果」時在 global.css 關掉
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'none' } },
        pop: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.3)' }, '100%': { transform: 'scale(1)' } },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        'draw-line': { from: { strokeDashoffset: '100' }, to: { strokeDashoffset: '0' } },
        'window-glow': { '0%, 100%': { opacity: '0.35' }, '50%': { opacity: '1' } },
        'splash-out': { to: { opacity: '0', visibility: 'hidden' } },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.25s ease-out both',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        pop: 'pop 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        'dot-bounce': 'dot-bounce 1.2s ease-in-out infinite',
        'draw-line': 'draw-line 1s ease-out both',
        'window-glow': 'window-glow 1.6s ease-in-out infinite',
        'splash-out': 'splash-out 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
