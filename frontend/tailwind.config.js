/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7B68B0',
          light: '#9384C4',
          dark: '#5F4E8F',
        },
        secondary: {
          DEFAULT: '#8FA0E8',
          light: '#C3CDFB',
        },
        accent: '#C6A8D6',
        blush: '#EDE0F5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(123, 104, 176, 0.12)',
      },
    },
  },
  plugins: [],
};
