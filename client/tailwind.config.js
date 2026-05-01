/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1877F2",
        "primary-light": "#4692F5",
        "primary-dark": "#135FC2",
        "primary-soft": "#E7F2FF",
        "neutral-dark": "#4B4C4F",
      }
    },
  },
  plugins: [],
}
