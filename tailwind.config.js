/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0FFCBE',
          50: '#E6FFFA',
          100: '#B3FFF0',
          200: '#80FFE5',
          300: '#4DFFDA',
          400: '#1AFCCF',
          500: '#0FFCBE',
          600: '#0CCF99',
          700: '#09A277',
          800: '#067558',
          900: '#034839',
        },
        brand: {
          teal: '#0FFCBE',
          dark: '#000000',
          gray: '#111111',
          card: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-teal': 'pulseTeal 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseTeal: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(15, 252, 190, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(15, 252, 190, 0)' },
        },
      },
    },
  },
  plugins: [],
}
