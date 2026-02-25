/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Child-friendly soft palette
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ad',
          300: '#f6bb79',
          400: '#f19443',
          500: '#ed7620',
          600: '#de5c16',
          700: '#b84414',
          800: '#933618',
          900: '#772f17',
          950: '#40150a',
        },
        soft: {
          mint: '#b8e6d5',
          lavender: '#e8d5f2',
          peach: '#ffdfd3',
          sky: '#d5e8f7',
        },
        risk: {
          low: '#22c55e',
          moderate: '#f59e0b',
          high: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'cursive'],
      },
    },
  },
  plugins: [],
}
