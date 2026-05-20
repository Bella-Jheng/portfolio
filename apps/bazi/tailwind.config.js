/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    fontFamily: {
      sans: ['Noto Sans TC', 'sans-serif'],
      serif: ['Noto Serif TC', 'serif'],
    },
    extend: {
      colors: {
        bz: {
          // Light cream theme
          cream: '#F0EBE3',      // page background
          paper: '#FAF7F4',      // card / input background
          'paper-dark': '#EDE8E2',
          brown: '#2D2420',      // primary text
          mid: '#6B5D57',        // secondary text
          muted: '#9B8A83',      // muted / placeholder
          border: '#D8CFC8',     // borders
          terra: '#C4544A',      // primary accent (buttons)
          'terra-dark': '#A3372E',
          'terra-light': '#F5E8E6',
          // Kept for pillar cards / decorative
          gold: '#C9A84C',
          'gold-light': '#FDF3DC',
          // Element palette (for result hero gradients)
          wood: '#7AC97A',
          fire: '#E87878',
          earth: '#D4A830',
          metal: '#60A8D0',
          water: '#9070C0',
          // Mystic theme (dark/immersive)
          mystic: {
            bg: '#0a0a0f',
            surface: '#161622',
            card: 'rgba(22, 22, 34, 0.7)',
            border: 'rgba(212, 175, 55, 0.15)',
            text: '#f2f2f7',
            muted: '#8e8e9f',
            gold: '#D4AF37',
            goldMuted: 'rgba(212, 175, 55, 0.4)',
          },
          // Magazine theme (light/airy reference)
          magazine: {
            bg: '#FFFDF5',
            yellow: '#FCD060',
            yellowLight: '#FDE49B',
            text: '#4A4A4A',
            muted: '#9E9E9E',
            border: '#F0EBE3',
          },
          // Legacy aliases — mapped to readable values in the new light theme
          ink: '#2D2420',
          parchment: '#2D2420',   // was cream-on-dark; now dark-on-light
          red: '#C4544A',
          'red-light': '#F5E8E6',
          dark: '#F0EBE3',
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '20px',
          md: '40px',
          xl: '72px',
        },
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        fadeIn: 'fadeIn 0.5s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
