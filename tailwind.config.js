/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',   // NEW — enables dark: variants driven by useTheme's class
  theme: {
    extend: {},
  },
  plugins: [],
}