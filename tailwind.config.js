/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: {
          light: '#ff7a45',
          DEFAULT: '#e35f24',
          dark: '#b83a00',
        },
        gold: {
          light: '#f3e5ab',
          DEFAULT: '#d4af37',
          dark: '#aa8c2c',
        },
        maroon: {
          light: '#9a1a1a',
          DEFAULT: '#800000',
          dark: '#5c0000',
        },
        cream: {
          light: '#fffef0',
          DEFAULT: '#fffdd0',
          dark: '#f5f2c2',
        },
        temple: {
          50: '#fdfbfa',
          100: '#faf3ee',
          200: '#f3e2d6',
          300: '#e5c4af',
          400: '#d39e7d',
          500: '#be744d',
          600: '#ab5d3c',
          700: '#8e4a2f',
          800: '#753e28',
          900: '#603523',
          dark: '#1a0f0a',
          darker: '#110906',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        odia: ['Noto Sans Odia', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'bell': 'bellRing 2s ease-in-out infinite',
        'diya': 'diyaFlicker 1.5s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'float-slow': 'floatUp 8s linear infinite',
      },
      keyframes: {
        bellRing: {
          '0%, 100%': { transform: 'rotate(0)' },
          '15%': { transform: 'rotate(10deg)' },
          '30%': { transform: 'rotate(-8deg)' },
          '45%': { transform: 'rotate(6deg)' },
          '60%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(2deg)' },
        },
        diyaFlicker: {
          '0%': { transform: 'scale(1) opacity(0.95)', filter: 'drop-shadow(0 0 4px rgba(227, 95, 36, 0.6))' },
          '100%': { transform: 'scale(1.08) opacity(1)', filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.9))' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        floatUp: {
          '0%': { transform: 'translateY(100%) scale(0.8)', opacity: '0' },
          '10%': { opacity: '0.4' },
          '90%': { opacity: '0.4' },
          '100%': { transform: 'translateY(-10%) scale(1.1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
