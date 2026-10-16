/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
        merriweather: ['"Merriweather"', 'serif'],
        oswald: ['"Oswald"', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
        dancing: ['"Dancing Script"', 'cursive'],
      },
      colors: {
        'warm-bg': '#F6F5F2',
        warm: {
          bg: '#F6F5F2',
          surface: '#FFFFFF',
          muted: '#EFECE6',
        },
        terracotta: {
          50: '#FBF6F4',
          100: '#F7ECE7',
          200: '#EDD5CC',
          300: '#DFB7A9',
          400: '#CE907C',
          500: '#B85D43',
          600: '#A34E35',
          700: '#863D28',
          800: '#6E3423',
          900: '#5B2C1E',
          950: '#35160E',
        },
        canvas: {
          bg: '#EBEAE6',
          dot: '#D6D4CD',
        }
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'soft': '0 2px 8px -1px rgba(0, 0, 0, 0.06), 0 1px 3px -1px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 3px 6px -2px rgba(0, 0, 0, 0.04)',
        'spread': '0 20px 40px -10px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
