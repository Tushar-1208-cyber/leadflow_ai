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
        brand: {
          50: '#f4f7fb',
          100: '#e8eff7',
          200: '#caddf0',
          300: '#9fc2e4',
          400: '#6ca1d3',
          500: '#4782c0',
          600: '#3568a3',
          700: '#2c5485',
          800: '#27476f',
          900: '#233d5d',
          950: '#15243b',
        },
        darkbg: {
          50: '#1e293b',
          100: '#0f172a',
          200: '#020617',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
