/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17160f",
        paper: "#f7f5f0",
        surface: "#ffffff",
        stone: "#8a8578",
        line: "#e3e0d7",
        muted: "#57544a",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      maxWidth: {
        content: "1400px",
      },
      letterSpacing: {
        wide2: "0.08em",
      },
    },
  },
  plugins: [],
};