/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./views/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'sidebar': '#2c3e50',
        'sidebar-light': '#34495e',
        'main-bg': '#ecf0f1',
        'accent': '#1abc9c',
        'accent-hover': '#16a085',
        'text-main': '#34495e',
        'text-light': '#bdc3c7',
        'card-bg': '#ffffff',
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
  // Adiciona o plugin de tipografia
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
