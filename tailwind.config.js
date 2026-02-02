/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'serif'],  // Cambiar la fuente sans-serif predeterminada
        custom: ['Poppins', 'serif'], // Añadir tu fuente personalizada
    },
  },
},
  plugins: [],
}

