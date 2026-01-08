/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE799',
          300: '#FFDB66',
          400: '#FFCF33',
          500: '#FFCB37',
          600: '#FFB032',
          700: '#FF9B2F',
          800: '#FF902E',
          900: '#E67A1A',
          950: '#CC6600'
        }
      }
    }
  },
  plugins: [],
}

