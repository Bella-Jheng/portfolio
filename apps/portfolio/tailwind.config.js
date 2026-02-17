// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

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
      '3xl': '1920px',
    },
    fontFamily: {
      sans: ['Rund Display', 'Noto Sans TC', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      tiny: '14px',
      base: '15px',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.375rem',
      '2xl': '1.5rem',
      '3xl': '1.75rem',
      '4xl': '2rem',
      '5xl': '2.25rem',
      '6xl': '2.5rem',
      '7xl': '3rem',
      '8xl': '4rem',
    },
    fontWeight: {
      'extra-light': 100,
      thin: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      'extra-bold': 800,
      black: 900,
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '20px',
        sm: '20px',
        md: '40px',
        '2xl': '72px',
        '3xl': '160px',
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1920px',
      },
    },
    zIndex: {
      '-10': '-10',
      0: 0,
      25: 25,
      50: 50,
      75: 75,
      100: 100,
      auto: 'auto',
    },
    // 需要特別設定可以打開
    boxShadow: {
      button: '0 4px 25px rgba(46, 46, 46, 0.1)',
      buttonHover: '0 8px 20px rgba(46, 46, 46, 0.1)',
      card: '0 10px 20px rgba(172, 172, 172, 0.5)',
      filter: '0 4px 25px rgba(12, 12, 12, 0.1)',
      barShadow: '0 -4px 25px rgba(12, 12, 12, 0.1)',
      // sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      // DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      // md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      // lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      // xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      // '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      // '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      // inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
    },
    extend: {
      colors: {
        transparent: 'transparent',
        black: '#000000',
        white: '#FFFFFF',
        pr: {
          brown: '#2E0014',
          light: '#FFFDDE',
          green: '#ACCB86',
          red: '#C62823',
        },
        txt: {
          brown: '#2E0014',
          darkBrown: '#2D1B1B',
          light: '#FFFDDE',
          green: '#ACCB86',
          red: '#C62823',
        },
        gray: {
          200: '#F9F9F9',
          300: '#E8E8E8',
          400: '#D2D2D2',
          500: '#C2C2C2',
          600: '#AAAAAA',
          700: '#8A8A8A',
          800: '#404040',
          900: '#222222',
        },
        ad: {
          sale: '#B25927',
          error: '#8F2B0B',
          'error-light': '#FFF4F1',
          success: '#66B686',
        },
      },
      spacing: {
        px: '1px',
        0: '0',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        2.5: '0.625rem',
        3: '0.75rem',
        3.5: '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        11: '2.75rem',
        12: '3rem',
        14: '3.5rem',
        15: '3.75rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        30: '7.5rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
      },
      borderRadius: {
        none: '0',
        sm: '.125rem',
        DEFAULT: '.25rem',
        lg: '.5rem',
        full: '9999px',
      },
      gridTemplateRows: {
        // Simple 10 row grid
        10: 'repeat(10, minmax(0, 1fr))',
      },
      // 需要特別設定可以打開
      dropShadow: {
        '3xl': '0 35px 35px rgba(0, 0, 0, 0.25)',
        top: '20px -1px 15px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        lazyload: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        lazyload: 'lazyload 1.5s infinite',
      },
      containers: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};
