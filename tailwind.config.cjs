/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './projects/*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        gold: '#F5C518',
        dark: '#0a0a0a',
        card: '#111111',
      },
      fontFamily: {
        display: ['Bebas Neue', 'cursive'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
