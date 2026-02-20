/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        danger: '#DC2626',
        success: '#059669',
      },
      fontSize: {
        'base': ['16px', '24px'], // Mindestens 16px für Barrierefreiheit
      }
    },
  },
  plugins: [],
}